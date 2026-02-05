"use client";

import { useEffect, useState, useCallback } from "react";
import { useBotState } from "@/hooks/useBotState";
import { useSettings } from "@/hooks/useSettings";
import { SetupQuality } from "@/components/SetupQuality";
import { Sparkline } from "@/components/Sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TrendingUp, TrendingDown, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BotState } from "@/types/botState";

function fmtPct(x: number | null | undefined): string {
  if (x == null || !Number.isFinite(x)) return "—";
  return (x * 100).toFixed(1) + "%";
}
function fmtNum(x: number | null | undefined, d = 0): string {
  if (x == null || !Number.isFinite(x)) return "—";
  return Number(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtTimeSec(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

const ACCENT = "text-primary";
const DENSITY = { comfortable: "gap-6 p-6 text-base", compact: "gap-4 p-4 text-sm" };

function deriveConditions(state: BotState) {
  const { predict, ta, regime } = state;
  const longPct = predict?.longPct ?? 0.5;
  const macd = ta?.macd?.bias;
  const vwapSlope = (ta?.vwapSlope ?? "").toLowerCase();
  const haColor = (ta?.heikenAshi?.color ?? "").toLowerCase();
  let bias: "Up" | "Neutral" | "Down" = longPct >= 0.58 ? "Up" : longPct <= 0.42 ? "Down" : "Neutral";
  const bullSignals = [macd === "bullish", vwapSlope === "up", haColor === "green"].filter(Boolean).length;
  const bearSignals = [macd === "bearish", vwapSlope === "down", haColor === "red"].filter(Boolean).length;
  const agreement = Math.abs(bullSignals - bearSignals);
  let confidence: "Low" | "Med" | "High" = agreement >= 2 ? "High" : agreement === 0 && !macd ? "Low" : "Med";
  const why: string[] = [];
  if (macd) why.push(`MACD bias: ${macd}`);
  if (vwapSlope && vwapSlope !== "flat") why.push(`VWAP slope: ${vwapSlope}`);
  if (regime) why.push(`Regime: ${regime}`);
  if (why.length < 3 && longPct !== 0.5) why.push(`Model bias: ${longPct >= 0.5 ? "up" : "down"} ${fmtPct(longPct)}`);
  const exec: string[] = [];
  if (state.prices?.spread != null) exec.push(`Spread ${(state.prices.spread * 100).toFixed(2)}¢`);
  if (state.prices?.liquidity != null) exec.push(`Liquidity ${fmtNum(state.prices.liquidity / 1000, 0)}k`);
  exec.push("Live feed");
  return { bias, confidence, why: why.slice(0, 3), executionNotes: exec };
}

function BotVsPublicCard({ state, accentClass }: { state: BotState; accentClass: string }) {
  const { prices, predict } = state;
  const botUp = predict?.longPct ?? 0.5;
  const botDown = predict?.shortPct ?? 0.5;
  const publicUp = prices?.up ?? 0.5;
  const publicDown = prices?.down ?? 0.5;
  const edgeUp = botUp - publicUp;
  const edgeDown = botDown - publicDown;
  const hasValueUp = edgeUp > 0.02;
  const hasValueDown = edgeDown > 0.02;
  const bestEdge = Math.max(edgeUp, edgeDown);
  const bestEdgeSide = edgeUp >= edgeDown ? "UP" : "DOWN";
  return (
    <Card className="rounded border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Bot vs Public</CardTitle>
        <span className={cn("text-3xl font-bold tabular-nums", bestEdge > 0.02 ? (bestEdgeSide === "UP" ? accentClass : "text-red-500") : "text-muted-foreground")}>{bestEdge > 0 ? "+" : ""}{(bestEdge * 100).toFixed(1)}%</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={cn("rounded border p-3", hasValueUp ? "border-primary/30 bg-primary/5" : "border-border")}>
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-muted-foreground">UP</span>{hasValueUp && <Badge variant="success" className="text-[10px] px-1.5 py-0">Value</Badge>}</div>
            <div className="text-sm space-y-0.5"><p><span className="text-muted-foreground">Bot:</span> <span className={cn("font-semibold tabular-nums", accentClass)}>{fmtPct(botUp)}</span></p><p><span className="text-muted-foreground">Public:</span> <span className="font-mono tabular-nums">{fmtPct(publicUp)}</span></p><p className={cn("text-xs font-medium", edgeUp > 0 ? accentClass : edgeUp < 0 ? "text-red-500" : "text-muted-foreground")}>{edgeUp > 0 ? "+" : ""}{(edgeUp * 100).toFixed(1)}% edge</p></div>
          </div>
          <div className={cn("rounded border p-3", hasValueDown ? "border-red-500/50 bg-red-500/5" : "border-border")}>
            <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-red-500" /><span className="text-xs font-medium text-muted-foreground">DOWN</span>{hasValueDown && <Badge variant="danger" className="text-[10px] px-1.5 py-0">Value</Badge>}</div>
            <div className="text-sm space-y-0.5"><p><span className="text-muted-foreground">Bot:</span> <span className="font-semibold tabular-nums text-red-500">{fmtPct(botDown)}</span></p><p><span className="text-muted-foreground">Public:</span> <span className="font-mono tabular-nums">{fmtPct(publicDown)}</span></p><p className={cn("text-xs font-medium", edgeDown > 0 ? "text-red-500" : edgeDown < 0 ? accentClass : "text-muted-foreground")}>{edgeDown > 0 ? "+" : ""}{(edgeDown * 100).toFixed(1)}% edge</p></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-t border-border pt-3">When bot % &gt; public %, that side may be underpriced. Not financial advice.</p>
      </CardContent>
    </Card>
  );
}

function EdgeQualityCard({ state, accentClass }: { state: BotState; accentClass: string }) {
  const eq = state.edgeQuality;
  if (!eq) return <Card className="rounded border-border"><CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Edge Quality</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Data pending.</p></CardContent></Card>;
  const bestRaw = Math.max(eq.rawEdgeUp ?? 0, eq.rawEdgeDown ?? 0);
  const bestReal = Math.max(eq.realEdgeUp ?? 0, eq.realEdgeDown ?? 0);
  const mult = eq.timeMultiplier;
  return (
    <Card className="rounded border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Edge Quality</CardTitle>
        <div className="text-right"><p className={cn("text-3xl font-bold tabular-nums leading-none", bestReal > 0 ? accentClass : "text-muted-foreground")}>{bestReal > 0 ? "+" : ""}{(bestReal * 100).toFixed(1)}%</p><p className="text-xs font-medium text-muted-foreground mt-0.5">Time-adjusted edge</p></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {eq.note && <p className="text-sm text-amber-600 dark:text-amber-500/90">{eq.note}</p>}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Raw edge</p><p className={cn("font-semibold tabular-nums", bestRaw > 0 ? accentClass : "text-muted-foreground")}>UP {fmtPct(eq.rawEdgeUp)} / DOWN {fmtPct(eq.rawEdgeDown)}</p></div>
          <div><p className="text-muted-foreground">Adjusted edge</p><p className={cn("font-semibold tabular-nums", bestReal > 0 ? accentClass : "text-muted-foreground")}>UP {fmtPct(eq.realEdgeUp)} / DOWN {fmtPct(eq.realEdgeDown)}</p></div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Move probability</span><span className="font-mono tabular-nums">{eq.moveProbability ?? "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Distance vs expected move</span><span className="font-mono tabular-nums">{eq.expectedMove != null && eq.distanceToStrike != null ? `$${eq.distanceToStrike.toFixed(0)} / $${eq.expectedMove.toFixed(0)}` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time multiplier</span><span className="font-mono tabular-nums">{eq.zScore != null ? `${(mult * 100).toFixed(0)}%` : "—"}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { state, connected, stale, paused, error } = useBotState();
  const { settings, update, toggleModule } = useSettings();
  const [commandOpen, setCommandOpen] = useState(false);
  const accent = ACCENT;
  const density = settings.layoutDensity;
  const mod = settings.modules;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen((o) => !o); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runCommand = useCallback((fn: () => void) => { fn(); setCommandOpen(false); }, []);

  if (!state) {
    const statusLabel = paused ? "PAUSED" : "OFFLINE";
    const statusVariant = paused ? "paused" : "secondary";
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Polymarket BTC 15m</h1>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
        </header>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
          <h2 className="text-lg font-medium text-foreground">
            Data feed offline
          </h2>
          <p className="text-center text-muted-foreground max-w-md">
            Decision engine not running. Analytics will update when the feed resumes.
          </p>
          {process.env.NODE_ENV !== "production" && paused && (
            <p className="text-xs text-muted-foreground">Set BOT_DISABLED=false to resume</p>
          )}
        </div>
      </main>
    );
  }

  const conditions = deriveConditions(state);
  const { market, prices, strike, ta, predict, session, etTime } = state;

  return (
    <main className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2"><h1 className="text-lg font-semibold">Polymarket BTC 15m</h1></div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Edge</span>
            <span className={cn("text-2xl font-bold tabular-nums", (state.robustEdge && (state.robustEdge.robustEdgeUp ?? 0) + (state.robustEdge.robustEdgeDown ?? 0) > 0) ? accent : "text-muted-foreground")}>
              {state.robustEdge ? `${(Math.max(state.robustEdge.robustEdgeUp ?? 0, state.robustEdge.robustEdgeDown ?? 0) * 100).toFixed(1)}%` : "—"}
            </span>
          </div>
          <span className="font-mono tabular-nums truncate max-w-[180px] text-muted-foreground">{market?.slug ?? "—"}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /><span className="font-mono tabular-nums">{fmtTimeSec(market?.timeLeftSec)}</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={connected && !stale ? "success" : stale ? "warning" : error ? "danger" : "secondary"} className="gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", connected && !stale ? "bg-primary animate-pulse" : "bg-muted-foreground")} />
            {connected && !stale ? "Live" : stale ? "STALE" : error ?? "Offline"}
          </Badge>
          <span className="font-mono tabular-nums text-muted-foreground text-xs">{state.timestamp ? new Date(state.timestamp).toLocaleTimeString() : "—"}</span>
          <Sheet>
            <SheetTrigger asChild><button type="button" className="rounded p-2 hover:bg-muted transition-colors" aria-label="Settings"><Settings className="h-5 w-5" /></button></SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:max-w-[320px]">
              <SheetHeader><SheetTitle>Settings</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div><label className="text-sm font-medium">Density</label><select value={settings.layoutDensity} onChange={(e) => update({ layoutDensity: e.target.value as "comfortable" | "compact" })} className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></div>
                <div><label className="text-sm font-medium">Modules</label><div className="mt-2 space-y-2">{(Object.keys(settings.modules) as Array<keyof typeof settings.modules>).map((key) => (<label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.modules[key]} onChange={() => toggleModule(key)} className="rounded border-border" /><span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span></label>))}</div></div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className={cn("mx-auto max-w-4xl px-6 py-8", DENSITY[density])}>
        {/* Zone 1: Decision */}
        <div className="mb-12">
          {state.robustEdge ? (
            <>
              <p className={cn("text-3xl font-bold tabular-nums", state.robustEdge.decision === "BUY" ? accent : "text-muted-foreground")}>
                {state.robustEdge.decision === "BUY" ? "WATCH" : "PASS"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {state.robustEdge.decision === "BUY"
                  ? `Edge survives time + cost, uncertainty discounted (on ${state.robustEdge.side ?? "—"})`
                  : state.robustEdge.reason.replace(/_/g, " ")}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Data pending.</p>
          )}
        </div>

        {/* Zone 2: Evidence — max 5 metrics */}
        <div className="mb-16 flex flex-wrap gap-x-12 gap-y-6">
          {state.robustEdge && (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Robust edge</p>
                <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", (Math.max(state.robustEdge.robustEdgeUp ?? 0, state.robustEdge.robustEdgeDown ?? 0) > 0) ? accent : "text-muted-foreground")}>
                  {Math.max(state.robustEdge.robustEdgeUp ?? 0, state.robustEdge.robustEdgeDown ?? 0) > 0 ? "+" : ""}{(Math.max(state.robustEdge.robustEdgeUp ?? 0, state.robustEdge.robustEdgeDown ?? 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Raw edge</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {(() => {
                    const best = (state.robustEdge.rawEdgeUp ?? 0) >= (state.robustEdge.rawEdgeDown ?? 0) ? state.robustEdge.rawEdgeUp : state.robustEdge.rawEdgeDown;
                    if (best == null) return "—";
                    const pct = (best * 100).toFixed(1);
                    return (best > 0 ? "+" : "") + pct + "%";
                  })()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time mult</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{state.robustEdge.timeMult != null ? `${(state.robustEdge.timeMult * 100).toFixed(0)}%` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exec cost</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{state.robustEdge.execCostUp != null ? `${(state.robustEdge.execCostUp * 100).toFixed(2)}%` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time left</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">{fmtTimeSec(market?.timeLeftSec)}</p>
              </div>
            </>
          )}
        </div>

        {/* Zone 3: Telemetry — raw details + model inputs */}
        <div className="pt-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Telemetry</p>
        <Accordion type="multiple" defaultValue={[]}>
          {mod.taSnapshot && (
            <AccordionItem value="ta" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">TA Snapshot</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Heiken Ashi</p><p className="font-mono tabular-nums">{ta?.heikenAshi?.color ?? "—"} ×{ta?.heikenAshi?.count ?? "—"}</p></div>
                  <div><p className="text-muted-foreground">RSI</p><p className="font-mono tabular-nums">{fmtNum(ta?.rsi, 1)}{ta?.rsiSlope != null ? (ta.rsiSlope > 0 ? " ↑" : " ↓") : ""}</p></div>
                  <div><p className="text-muted-foreground">MACD</p><p className={cn("font-mono tabular-nums", ta?.macd?.bias === "bullish" && accent, ta?.macd?.bias === "bearish" && "text-red-500")}>{ta?.macd?.label ?? "—"}</p></div>
                  <div><p className="text-muted-foreground">Δ1m / Δ3m</p><p className="font-mono tabular-nums">{ta?.delta1m != null ? ta.delta1m.toFixed(2) : "—"} / {ta?.delta3m != null ? ta.delta3m.toFixed(2) : "—"}</p></div>
                  <div className="sm:col-span-2"><p className="text-muted-foreground">VWAP</p><p className="font-mono tabular-nums">{fmtNum(ta?.vwap, 0)}{ta?.vwapDistPct != null ? ` (${ta.vwapDistPct > 0 ? "+" : ""}${ta.vwapDistPct.toFixed(2)}%)` : ""} slope: {ta?.vwapSlope ?? "—"}</p></div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.microstructure && (
            <AccordionItem value="micro" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Microstructure</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Price to beat:</span> ${fmtNum(strike?.priceToBeat, 0)}</p>
                  <p><span className="text-muted-foreground">Diff vs PTB:</span> {strike?.diff != null ? (strike.diff > 0 ? "+" : "") + "$" + strike.diff.toFixed(2) : "—"}</p>
                  <p><span className="text-muted-foreground">Predict:</span> LONG {fmtPct(predict?.longPct)} / SHORT {fmtPct(predict?.shortPct)}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.sources && (
            <AccordionItem value="sources" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Sources</AccordionTrigger>
              <AccordionContent><div className="space-y-2 text-sm text-muted-foreground"><p>Chainlink (Polygon) · Polymarket WS · Binance</p><p>Session: {session ?? "—"} | {etTime ?? "—"}</p></div></AccordionContent>
            </AccordionItem>
          )}
          {mod.conditions && (
            <AccordionItem value="conditions" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Conditions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-6">
                    <div><p className="text-muted-foreground">Bias</p><p className={cn("font-semibold tabular-nums", conditions.bias === "Up" && accent, conditions.bias === "Down" && "text-red-500")}>{conditions.bias}</p></div>
                    <div><p className="text-muted-foreground">Confidence</p><p className="font-semibold tabular-nums">{conditions.confidence}</p></div>
                  </div>
                  <div><p className="text-muted-foreground">Why</p><ul className="list-disc list-inside space-y-0.5 text-muted-foreground">{conditions.why.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
                  <p className="text-muted-foreground">{conditions.executionNotes.join(" · ")}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.botVsMarket && (
            <AccordionItem value="bot" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Bot vs Public</AccordionTrigger>
              <AccordionContent>
                <BotVsPublicCard state={state} accentClass={accent} />
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.edgeQuality && (
            <AccordionItem value="eq" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Edge Quality</AccordionTrigger>
              <AccordionContent>
                <EdgeQualityCard state={state} accentClass={accent} />
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.marketPrices && (
            <AccordionItem value="prices" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Market Prices</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">UP</span><span className={cn("font-mono tabular-nums", accent)}>{prices?.up != null ? (prices.up * 100).toFixed(1) + "¢" : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">DOWN</span><span className="font-mono tabular-nums text-red-500">{prices?.down != null ? (prices.down * 100).toFixed(1) + "¢" : "—"}</span></div>
                  <p className="text-muted-foreground">Implied: UP {fmtPct(prices?.up)} / DOWN {fmtPct(prices?.down)}</p>
                  <p className="text-muted-foreground">Spread {prices?.spread != null ? (prices.spread * 100).toFixed(2) + "¢" : "—"} · Liq {fmtNum(prices?.liquidity ? prices.liquidity / 1000 : null, 0)}k</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.btcPrice && (
            <AccordionItem value="btc" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">BTC Price</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p className={cn("text-xl font-semibold tabular-nums", accent)}>${fmtNum(strike?.currentPrice ?? state.binance?.spot, 0)}</p>
                  <p className="text-muted-foreground">Chainlink (settlement)</p>
                  {state.binance && <><p className="font-mono tabular-nums">Binance ${fmtNum(state.binance.spot, 0)}{state.binance.spotDiffUsd != null && <span className={cn("ml-2", state.binance.spotDiffUsd > 0 ? accent : "text-red-500")}>({state.binance.spotDiffUsd > 0 ? "+" : ""}${state.binance.spotDiffUsd.toFixed(2)})</span>}</p><Sparkline data={state.sparkline ?? null} accentClass={accent} height={40} /></>}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {mod.setupQuality && (
            <AccordionItem value="setup" className="border-0 pt-4 first:pt-0 px-0">
              <AccordionTrigger className="hover:no-underline">Setup Quality</AccordionTrigger>
              <AccordionContent>
                <SetupQuality state={state} accentClass={accent} density={density} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        </div>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Jump to module or toggle..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Modules">
            {(Object.keys(settings.modules) as Array<keyof typeof settings.modules>).map((key) => (
              <CommandItem key={key} onSelect={() => runCommand(() => toggleModule(key))}>
                {settings.modules[key] ? "Hide" : "Show"} {key.replace(/([A-Z])/g, " $1").trim()}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </main>
  );
}
