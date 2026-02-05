"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useBotState } from "@/hooks/useBotState";

type ConnectionStatus = "LIVE" | "STALE" | "OFFLINE" | "PAUSED";

interface TerminalState {
  ts: string | null;
  market: {
    slug: string | null;
    title: string | null;
    timeLeftSec: number | null;
    spread: number | null;
  };
  prices: { up: number | null; down: number | null };
  liquidity: number | null;
  chainlinkPrice: number | null;
  binancePrice: number | null;
  binanceDiffUsd: number | null;
  binanceDiffPct: number | null;
  strike: { priceToBeat: number | null; currentPrice: number | null; diff: number | null };
  indicators: {
    rsi: number | null;
    rsiSlope: number | null;
    macd: { bias: string | null; label: string | null };
    heikenAshi: { color: string | null; count: number | null };
    vwap: number | null;
    vwapDistPct: number | null;
    vwapSlope: string | null;
    delta1m: number | null;
    delta3m: number | null;
  };
  recommendation: {
    action: string | null;
    side: string | null;
    interpretation: string | null;
    phase: string | null;
    strength: string | null;
  };
  predict: { longPct: number | null; shortPct: number | null };
  regime: string | null;
  session: string | null;
  etTime: string | null;
  sparkline: number[] | null;
}

const defaultState: TerminalState = {
  ts: null,
  market: { slug: null, title: null, timeLeftSec: null, spread: null },
  prices: { up: null, down: null },
  liquidity: null,
  chainlinkPrice: null,
  binancePrice: null,
  binanceDiffUsd: null,
  binanceDiffPct: null,
  strike: { priceToBeat: null, currentPrice: null, diff: null },
  indicators: {
    rsi: null,
    rsiSlope: null,
    macd: { bias: null, label: null },
    heikenAshi: { color: null, count: null },
    vwap: null,
    vwapDistPct: null,
    vwapSlope: null,
    delta1m: null,
    delta3m: null,
  },
  recommendation: { action: null, side: null, interpretation: null, phase: null, strength: null },
  predict: { longPct: null, shortPct: null },
  regime: null,
  session: null,
  etTime: null,
  sparkline: null,
};

/** Map API response (BotState or ingest payload) to TerminalState */
function mapToTerminalState(raw: unknown): TerminalState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const ts = (s.timestamp as string) ?? (s.ts as string) ?? null;
  if (!ts && !s.market && !s.prices) return null;
  const market = s.market as Record<string, unknown> | undefined;
  const prices = s.prices as Record<string, unknown> | undefined;
  const strike = s.strike as Record<string, unknown> | undefined;
  const ta = s.ta as Record<string, unknown> | undefined;
  const indicators = s.indicators as Record<string, unknown> | undefined;
  const binance = s.binance as Record<string, unknown> | undefined;
  return {
    ts,
    market: {
      slug: (market?.slug as string) ?? null,
      title: (market?.title as string) ?? null,
      timeLeftSec: (market?.timeLeftSec as number) ?? null,
      spread: (market?.spread as number) ?? (prices?.spread as number) ?? null,
    },
    prices: {
      up: (prices?.up as number) ?? null,
      down: (prices?.down as number) ?? null,
    },
    liquidity: (prices?.liquidity as number) ?? (s.liquidity as number) ?? null,
    chainlinkPrice: (strike?.currentPrice as number) ?? (s.chainlinkPrice as number) ?? null,
    binancePrice: (binance?.spot as number) ?? (s.binancePrice as number) ?? null,
    binanceDiffUsd: (binance?.spotDiffUsd as number) ?? (s.binanceDiffUsd as number) ?? null,
    binanceDiffPct: (binance?.spotDiffPct as number) ?? (s.binanceDiffPct as number) ?? null,
    strike: strike
      ? {
          priceToBeat: (strike.priceToBeat as number) ?? null,
          currentPrice: (strike.currentPrice as number) ?? null,
          diff: (strike.diff as number) ?? null,
        }
      : defaultState.strike,
    indicators: {
      rsi: ((ta?.rsi ?? indicators?.rsi) ?? null) as number | null,
      rsiSlope: ((ta?.rsiSlope ?? indicators?.rsiSlope) ?? null) as number | null,
      macd: ((ta?.macd ?? indicators?.macd) ?? defaultState.indicators.macd) as { bias: string | null; label: string | null },
      heikenAshi: ((ta?.heikenAshi ?? indicators?.heikenAshi) ?? defaultState.indicators.heikenAshi) as { color: string | null; count: number | null },
      vwap: ((ta?.vwap ?? indicators?.vwap) ?? null) as number | null,
      vwapDistPct: ((ta?.vwapDistPct ?? indicators?.vwapDistPct) ?? null) as number | null,
      vwapSlope: ((ta?.vwapSlope ?? indicators?.vwapSlope) ?? null) as string | null,
      delta1m: ((ta?.delta1m ?? indicators?.delta1m) ?? null) as number | null,
      delta3m: ((ta?.delta3m ?? indicators?.delta3m) ?? null) as number | null,
    },
    recommendation: ((s.betAdvantage ?? s.recommendation) ?? defaultState.recommendation) as TerminalState["recommendation"],
    predict: (s.predict as TerminalState["predict"]) ?? defaultState.predict,
    regime: (s.regime as string) ?? null,
    session: (s.session as string) ?? null,
    etTime: (s.etTime as string) ?? null,
    sparkline: Array.isArray(s.sparkline) ? s.sparkline : null,
  };
}

function fmt(v: number | null | undefined, d = 0): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return (v * 100).toFixed(1) + "%";
}
function fmtTime(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border border-terminal-border bg-black p-1.5", className)}>
      <div className="mb-0.5 border-b border-terminal-border pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
        {title}
      </div>
      <div className="text-[11px] leading-tight">{children}</div>
    </div>
  );
}

function Kv({ k, v, vClass }: { k: React.ReactNode; v: string; vClass?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-terminal-muted shrink-0">{k}</span>
      <span className={cn("font-mono tabular-nums text-right", vClass)}>{v}</span>
    </div>
  );
}

export default function TerminalPage() {
  const [paused, setPaused] = useState(false);
  const { state: botState, connected, stale, paused: botPaused, refetch } = useBotState({ enabled: !paused });
  const state = botState ? mapToTerminalState(botState) ?? defaultState : defaultState;
  const status: ConnectionStatus = botPaused
    ? "PAUSED"
    : connected && !stale
      ? "LIVE"
      : connected && stale
        ? "STALE"
        : "OFFLINE";
  const [theme, setTheme] = useState<"green" | "cyan">("green");
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "g") setTheme((t) => (t === "green" ? "cyan" : "green"));
      if (e.key === "r") refetch();
      if (e.key === "s") setPaused((p) => !p);
      if (e.key === "?") setHelpOpen((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refetch]);

  const accent = theme === "green" ? "text-emerald-400" : "text-cyan-400";
  const accentDim = theme === "green" ? "text-emerald-600" : "text-cyan-600";

  const tickerItems = [
    state.market?.slug ?? "—",
    `BTC ${fmt(state.chainlinkPrice ?? state.binancePrice, 0)}`,
    `UP ${state.prices?.up != null ? (state.prices.up * 100).toFixed(1) + "¢" : "—"}`,
    `DOWN ${state.prices?.down != null ? (state.prices.down * 100).toFixed(1) + "¢" : "—"}`,
    `RSI ${fmt(state.indicators?.rsi, 1)}`,
    state.indicators?.macd?.label ?? "—",
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-black font-mono text-[11px] text-terminal-fg",
        "terminal-page"
      )}
      style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', monospace" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-terminal-border bg-black px-2 py-1">
        <div className="flex items-center gap-4">
          <span className={cn("font-semibold", accent)}>POLYMARKET BTC 15m</span>
          <span className="text-terminal-muted">|</span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase",
              status === "LIVE" && accent,
              status === "STALE" && "text-amber-500",
              status === "OFFLINE" && "text-red-500",
              status === "PAUSED" && "text-muted-foreground"
            )}
          >
            {status}
          </span>
          {paused && (
            <>
              <span className="text-terminal-muted">|</span>
              <span className="text-amber-500">PAUSED</span>
            </>
          )}
        </div>
        <div className="text-terminal-muted text-[10px]">
          {state.ts ? new Date(state.ts).toLocaleTimeString() : "—"} | g:theme r:reconnect s:pause ?:help
        </div>
      </div>

      {/* Ticker */}
      <div className="border-b border-terminal-border bg-black py-0.5">
        <div className="animate-ticker flex gap-8 overflow-hidden whitespace-nowrap text-[10px] text-terminal-muted">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-px border-b border-terminal-border bg-terminal-border lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-px bg-terminal-border">
          <Panel title="MARKET" className="min-h-[80px]">
            <Kv k="Market" v={state.market?.slug ?? "—"} />
            <Kv k="Time left" v={fmtTime(state.market?.timeLeftSec)} />
            <Kv k="Liquidity" v={fmt(state.liquidity, 0)} />
            <Kv k="Spread" v={state.market?.spread != null ? state.market.spread.toFixed(4) : "—"} />
          </Panel>
          <Panel title="ORDER / YES-NO">
            <Kv
              k="UP"
              v={state.prices?.up != null ? (state.prices.up * 100).toFixed(1) + "¢" : "—"}
              vClass={accent}
            />
            <Kv
              k="DOWN"
              v={state.prices?.down != null ? (state.prices.down * 100).toFixed(1) + "¢" : "—"}
              vClass="text-red-400"
            />
            <div className="mt-0.5 text-terminal-muted text-[9px]">
              Implied: UP {fmtPct(state.prices?.up)} / DOWN {fmtPct(state.prices?.down)}
            </div>
          </Panel>
        </div>

        {/* Center column */}
        <div className="flex flex-col gap-px bg-terminal-border">
          <Panel title="BTC PRICE" className="min-h-[100px]">
            <div className={cn("text-2xl font-bold tabular-nums", accent)}>
              ${fmt(state.chainlinkPrice ?? state.binancePrice, 0)}
            </div>
            <div className="mt-0.5 text-terminal-muted text-[10px]">
              Chainlink (settlement)
            </div>
            <div className="mt-1 text-[12px]">
              Binance: ${fmt(state.binancePrice, 0)}
              {state.binanceDiffUsd != null && (
                <span
                  className={cn(
                    "ml-1",
                    state.binanceDiffUsd > 0 ? "text-emerald-400" : state.binanceDiffUsd < 0 ? "text-red-400" : ""
                  )}
                >
                  ({state.binanceDiffUsd > 0 ? "+" : ""}
                  ${state.binanceDiffUsd.toFixed(2)},{" "}
                  {state.binanceDiffPct != null
                    ? (state.binanceDiffPct > 0 ? "+" : "") + state.binanceDiffPct.toFixed(2) + "%"
                    : "—"}
                  )
                </span>
              )}
            </div>
            <div className="mt-0.5 text-terminal-muted text-[9px]">
              Updated: {state.ts ? new Date(state.ts).toLocaleTimeString() : "—"}
            </div>
          </Panel>
          <Panel title="CHART" className="min-h-[120px]">
            <Sparkline data={state.sparkline} accent={accent} />
          </Panel>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-px bg-terminal-border">
          <Panel title="TA">
            <Kv k="RSI" v={fmt(state.indicators?.rsi, 1)} />
            <Kv k="MACD" v={state.indicators?.macd?.label ?? "—"} />
            <Kv k="Heiken Ashi" v={`${state.indicators?.heikenAshi?.color ?? "—"} ×${state.indicators?.heikenAshi?.count ?? "—"}`} />
            <Kv k="VWAP" v={`${fmt(state.indicators?.vwap, 0)} (${state.indicators?.vwapSlope ?? "—"})`} />
            <Kv k="Δ1m / Δ3m" v={`${fmt(state.indicators?.delta1m, 2)} / ${fmt(state.indicators?.delta3m, 2)}`} />
          </Panel>
          <Panel title="PREDICT">
            <div className="flex justify-between gap-2">
              <span className={accent}>LONG {fmtPct(state.predict?.longPct)}</span>
              <span className="text-red-400">SHORT {fmtPct(state.predict?.shortPct)}</span>
            </div>
            <div className="mt-0.5 h-1 w-full overflow-hidden rounded-sm bg-terminal-muted/30">
              <div
                className={cn("h-full", accentDim)}
                style={{
                  width: `${((state.predict?.longPct ?? 0.5) * 100).toFixed(0)}%`,
                }}
              />
            </div>
            <div className="mt-1 border-t border-terminal-border pt-0.5 text-[9px] text-terminal-muted">
              {state.recommendation?.interpretation ?? "—"}
            </div>
          </Panel>
        </div>
      </div>

      {/* Help modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="border border-terminal-border bg-black p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 border-b border-terminal-border pb-2 font-semibold">Keyboard shortcuts</div>
            <div className="space-y-1 text-[11px]">
              <p><kbd className="rounded border border-terminal-border px-1">g</kbd> Toggle green/cyan theme</p>
              <p><kbd className="rounded border border-terminal-border px-1">r</kbd> Reconnect stream</p>
              <p><kbd className="rounded border border-terminal-border px-1">s</kbd> Pause/resume updates</p>
              <p><kbd className="rounded border border-terminal-border px-1">?</kbd> Show/hide this help</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, accent }: { data: number[] | null; accent: string }) {
  if (!data || data.length < 2) {
    return <div className="text-terminal-muted text-[10px]">No data</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 60;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={accent}
        points={pts.join(" ")}
      />
    </svg>
  );
}
