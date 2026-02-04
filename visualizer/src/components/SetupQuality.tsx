"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BotState } from "@/types/botState";

interface SetupQualityProps {
  state: BotState;
  accentClass: string;
  density: "comfortable" | "compact";
}

interface ComponentScore {
  label: string;
  score: number;
  weight: number;
  rationale: string;
}

export function computeSetupQuality(state: BotState): {
  total: number;
  label: string;
  components: ComponentScore[];
  rationale: string;
} {
  const { prices, ta, predict, regime, market, strike, edgeQuality } = state;
  const liquidity = prices?.liquidity ?? null;
  const spread = prices?.spread ?? null;
  const macd = ta?.macd;
  const rsi = ta?.rsi;
  const vwapSlope = (ta?.vwapSlope ?? "").toLowerCase();
  const haCount = ta?.heikenAshi?.count ?? 0;
  const delta1m = ta?.delta1m ?? 0;
  const delta3m = ta?.delta3m ?? 0;
  const longPct = predict?.longPct ?? 0.5;
  const regimeLower = (regime ?? "").toLowerCase();

  let liqScore = 50;
  if (liquidity != null) {
    if (liquidity >= 100_000) liqScore = 95;
    else if (liquidity >= 50_000) liqScore = 80;
    else if (liquidity >= 20_000) liqScore = 65;
    else if (liquidity >= 5_000) liqScore = 50;
    else liqScore = 30;
  }
  let spreadScore = 50;
  if (spread != null) {
    if (spread <= 0.01) spreadScore = 95;
    else if (spread <= 0.02) spreadScore = 80;
    else if (spread <= 0.05) spreadScore = 60;
    else spreadScore = 35;
  }
  const aScore = (liqScore + spreadScore) / 2;

  const deltaMag = Math.abs(delta1m) + Math.abs(delta3m);
  let bScore = 50;
  if (regimeLower.includes("low") || regimeLower.includes("range")) bScore = 85;
  else if (regimeLower.includes("trend")) bScore = 70;
  else if (regimeLower.includes("high") || regimeLower.includes("chop")) bScore = 40;
  else if (deltaMag < 50) bScore = 75;
  else if (deltaMag < 150) bScore = 60;
  else bScore = 45;

  const hasSlope = vwapSlope === "up" || vwapSlope === "down";
  const hasConsec = haCount >= 2;
  let cScore = 50;
  if (hasSlope && hasConsec) cScore = 85;
  else if (hasSlope || hasConsec) cScore = 65;
  else if (vwapSlope === "flat" && haCount <= 1) cScore = 40;

  const macdBull = macd?.bias === "bullish";
  const macdBear = macd?.bias === "bearish";
  const favorsLong = longPct >= 0.55;
  const favorsShort = longPct <= 0.45;
  let dScore = 50;
  if ((macdBull && favorsLong) || (macdBear && favorsShort)) dScore = 90;
  else if ((macdBull && favorsShort) || (macdBear && favorsLong)) dScore = 35;
  else if ((macdBull || macdBear) && rsi != null && rsi >= 35 && rsi <= 65) dScore = 70;

  // Time feasibility: z < 0.5 → high, z < 1 → moderate, z < 2 → low, else very low
  let eScore = 50;
  const z = edgeQuality?.zScore;
  const timeLeftMin = (market?.timeLeftSec ?? 0) / 60;
  if (z != null && Number.isFinite(z)) {
    if (z < 0.5) eScore = 95;
    else if (z < 1) eScore = 75;
    else if (z < 2) eScore = 40;
    else eScore = 15;
  } else if (timeLeftMin < 2 && (strike?.diff != null && Math.abs(strike.diff) > 100)) {
    eScore = 20; // Little time, far from strike
  }

  const weights = [25, 20, 20, 15, 20];
  const scores = [aScore, bScore, cScore, dScore, eScore];
  const total = Math.round(
    scores.reduce((sum, s, i) => sum + (s * weights[i]) / 100, 0)
  );
  const clamped = Math.min(100, Math.max(0, total));

  let label = "Poor";
  if (clamped >= 80) label = "Great";
  else if (clamped >= 65) label = "Good";
  else if (clamped >= 45) label = "Fair";

  const rationale =
    clamped >= 65
      ? "Conditions favor clear structure; liquidity and regime support execution."
      : clamped >= 45
        ? "Mixed signals; some components supportive, others neutral."
        : "Weak structure; elevated cost or chop reduces setup clarity.";

  return {
    total: clamped,
    label,
    rationale,
    components: [
      { label: "Liquidity / cost", score: Math.round(aScore), weight: 25, rationale: liquidity != null && spread != null ? `Liquidity ${(liquidity / 1000).toFixed(0)}k, spread ${(spread * 100).toFixed(2)}¢` : "Data pending" },
      { label: "Volatility regime", score: Math.round(bScore), weight: 20, rationale: regime ? `Regime: ${regime}; move magnitude ${deltaMag.toFixed(0)}` : "Data pending" },
      { label: "Trend vs chop", score: Math.round(cScore), weight: 20, rationale: `VWAP slope ${vwapSlope || "—"}, HA run ${haCount}` },
      { label: "Signal agreement", score: Math.round(dScore), weight: 15, rationale: macd?.bias ? `MACD ${macd.bias}, model ${favorsLong ? "long" : "short"} ${(longPct * 100).toFixed(0)}%` : "Data pending" },
      { label: "Time feasibility", score: Math.round(eScore), weight: 20, rationale: z != null ? `z-score ${z.toFixed(2)}, ${edgeQuality?.moveProbability ?? "—"} move prob` : (timeLeftMin < 2 ? "Limited time remaining" : "Data pending") },
    ],
  };
}

export function SetupQuality({ state, accentClass, density }: SetupQualityProps) {
  const [expanded, setExpanded] = useState(false);
  const { total, label, components, rationale } = computeSetupQuality(state);
  const isCompact = density === "compact";

  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Setup Quality
          </h3>
          <span className={cn("text-4xl font-bold tabular-nums", accentClass)}>
            {total}
          </span>
        </div>
        <p className="text-lg font-medium tabular-nums text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{rationale}</p>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {components.map((c) => (
            <div key={c.label} className="flex justify-between gap-4 text-sm">
              <div>
                <span className="font-medium">{c.label}</span>
                <span className="ml-2 text-muted-foreground">({c.weight}%)</span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-medium">{c.score}</span>
                <p className="text-xs text-muted-foreground">{c.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
