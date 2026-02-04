import { clamp } from "../utils.js";

export function computeEdge({ modelUp, modelDown, marketYes, marketNo }) {
  if (marketYes === null || marketNo === null) {
    return { marketUp: null, marketDown: null, edgeUp: null, edgeDown: null };
  }

  const sum = marketYes + marketNo;
  const marketUp = sum > 0 ? marketYes / sum : null;
  const marketDown = sum > 0 ? marketNo / sum : null;

  const edgeUp = marketUp === null ? null : modelUp - marketUp;
  const edgeDown = marketDown === null ? null : modelDown - marketDown;

  return {
    marketUp: marketUp === null ? null : clamp(marketUp, 0, 1),
    marketDown: marketDown === null ? null : clamp(marketDown, 0, 1),
    edgeUp,
    edgeDown
  };
}

function pct(x) {
  if (x === null || x === undefined || !Number.isFinite(x)) return "-";
  return `${(x * 100).toFixed(1)}%`;
}

export function decide({ remainingMinutes, edgeUp, edgeDown, modelUp = null, modelDown = null }) {
  const phase = remainingMinutes > 10 ? "EARLY" : remainingMinutes > 5 ? "MID" : "LATE";

  const threshold = phase === "EARLY" ? 0.05 : phase === "MID" ? 0.1 : 0.2;

  const minProb = phase === "EARLY" ? 0.55 : phase === "MID" ? 0.6 : 0.65;

  if (edgeUp === null || edgeDown === null) {
    return {
      action: "NO_TRADE",
      side: null,
      phase,
      reason: "missing_market_data",
      interpretation: "No bet: market data missing (UP/DOWN prices)."
    };
  }

  const bestSide = edgeUp > edgeDown ? "UP" : "DOWN";
  const bestEdge = bestSide === "UP" ? edgeUp : edgeDown;
  const bestModel = bestSide === "UP" ? modelUp : modelDown;
  const modelUpPct = pct(modelUp);
  const modelDownPct = pct(modelDown);

  if (bestEdge < threshold) {
    return {
      action: "NO_TRADE",
      side: null,
      phase,
      reason: `edge_below_${threshold}`,
      interpretation: `No bet: best edge ${pct(bestEdge)} below required ${pct(threshold)} (${phase}). Model ${bestSide === "UP" ? modelUpPct : modelDownPct} not enough advantage vs market.`
    };
  }

  if (bestModel !== null && bestModel < minProb) {
    return {
      action: "NO_TRADE",
      side: null,
      phase,
      reason: `prob_below_${minProb}`,
      interpretation: `No bet: model prob ${pct(bestModel)} below minimum ${pct(minProb)} for ${phase}. Edge ${pct(bestEdge)} OK but conviction too low.`
    };
  }

  const strength = bestEdge >= 0.2 ? "STRONG" : bestEdge >= 0.1 ? "GOOD" : "OPTIONAL";
  const modelPct = bestSide === "UP" ? modelUpPct : modelDownPct;
  return {
    action: "ENTER",
    side: bestSide,
    phase,
    strength,
    edge: bestEdge,
    reason: "edge_above_threshold",
    interpretation: `BET SUGGESTED: ${bestSide} — Model ${modelPct} vs market; edge +${pct(bestEdge)} (${strength}). Phase: ${phase}.`
  };
}
