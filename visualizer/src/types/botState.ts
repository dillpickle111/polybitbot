/** Duplicate of bot's BotState shape (same as src/state.js buildBotState output). */
export interface BotState {
  timestamp: string;
  market: { slug: string | null; title: string | null; timeLeftSec: number | null };
  prices: { up: number | null; down: number | null; liquidity: number | null; spread?: number | null };
  sparkline?: number[] | null;
  strike: { priceToBeat: number | null; currentPrice: number | null; diff: number | null };
  predict: { longPct: number | null; shortPct: number | null };
  ta: {
    heikenAshi: { color: string | null; count: number | null };
    rsi: number | null;
    rsiSlope?: number | null;
    macd: { bias: string | null; label: string | null };
    delta1m: number | null;
    delta3m: number | null;
    vwap: number | null;
    vwapDistPct?: number | null;
    vwapSlope: string | null;
  };
  betAdvantage: {
    action: string | null;
    side: string | null;
    interpretation: string | null;
    phase: string | null;
    strength?: string | null;
  };
  binance?: {
    spot: number | null;
    spotDiffUsd: number | null;
    spotDiffPct: number | null;
  };
  regime: string | null;
  session: string | null;
  etTime: string | null;
  edgeQuality?: {
    rawEdgeUp: number | null;
    rawEdgeDown: number | null;
    realEdgeUp: number | null;
    realEdgeDown: number | null;
    timeMultiplier: number;
    expectedMove: number | null;
    distanceToStrike: number | null;
    zScore: number | null;
    moveProbability: "High" | "Moderate" | "Low" | null;
    note: string | null;
  } | null;
  robustEdge?: {
    side: string | null;
    decision: "BUY" | "PASS";
    reason: string;
    rawEdgeUp: number | null;
    rawEdgeDown: number | null;
    uncertaintyDiscountUp: number | null;
    uncertaintyDiscountDown: number | null;
    pLowUp: number | null;
    pLowDown: number | null;
    edgeLowUp: number | null;
    edgeLowDown: number | null;
    timeMult: number;
    execCostUp: number | null;
    execCostDown: number | null;
    robustEdgeUp: number | null;
    robustEdgeDown: number | null;
    robustRoiUp: number | null;
    robustRoiDown: number | null;
    kellyUp: number | null;
    kellyDown: number | null;
    interpretation: string;
  } | null;
}

export type VizMessage = { type: "state"; state: BotState };
