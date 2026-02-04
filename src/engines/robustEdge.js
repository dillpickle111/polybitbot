/**
 * Robust edge calculation with model uncertainty and execution cost.
 * Only recommends when edge survives conservative adjustments.
 *
 * q = market price (implied probability)
 * p = model probability
 * σ = model uncertainty (rolling std of p, with floor)
 * p_low = p - z*σ (z=1.28 for ~90% one-sided)
 * edge_low = p_low - q
 * robust_edge = edge_low * time_mult - exec_cost
 * robust_roi = robust_edge / q
 * kelly = (p_low - q)/(1 - q)
 */

import { clamp } from "../utils.js";

const Z_90 = 1.28;
const SIGMA_FLOOR = 0.02;
const HISTORY_SIZE = 30;

const pHistoryUp = [];
const pHistoryDown = [];

function rollingStd(values, minFloor = SIGMA_FLOOR) {
  if (!Array.isArray(values) || values.length < 2) return minFloor;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  const std = Math.sqrt(variance);
  return Number.isFinite(std) ? Math.max(std, minFloor) : minFloor;
}

function pushHistory(pUp, pDown) {
  if (pUp != null && Number.isFinite(pUp)) {
    pHistoryUp.push(clamp(pUp, 0, 1));
    if (pHistoryUp.length > HISTORY_SIZE) pHistoryUp.shift();
  }
  if (pDown != null && Number.isFinite(pDown)) {
    pHistoryDown.push(clamp(pDown, 0, 1));
    if (pHistoryDown.length > HISTORY_SIZE) pHistoryDown.shift();
  }
}

export function computeRobustEdge({
  modelUp,
  modelDown,
  marketUp,
  marketDown,
  timeMult,
  spread,
  config = {}
}) {
  const {
    feePct = 0.02,
    slippagePct = 0.005,
    spreadPenaltyFactor = 0.5,
    minRobustRoi = 0.1,
    minTimeMult = 0.35,
    minKellyPctBankroll = 0.0025
  } = config;

  pushHistory(modelUp, modelDown);

  const sum = (marketUp ?? 0) + (marketDown ?? 0);
  const qUp = sum > 0 ? (marketUp ?? 0) / sum : null;
  const qDown = sum > 0 ? (marketDown ?? 0) / sum : null;

  if (qUp == null || qDown == null) {
    return {
      side: null,
      decision: "PASS",
      reason: "missing_market_data",
      rawEdgeUp: null,
      rawEdgeDown: null,
      uncertaintyDiscountUp: null,
      uncertaintyDiscountDown: null,
      pLowUp: null,
      pLowDown: null,
      edgeLowUp: null,
      edgeLowDown: null,
      timeMult,
      execCostUp: null,
      execCostDown: null,
      robustEdgeUp: null,
      robustEdgeDown: null,
      robustRoiUp: null,
      robustRoiDown: null,
      kellyUp: null,
      kellyDown: null,
      interpretation: "Market data missing."
    };
  }

  const sigmaUp = rollingStd(pHistoryUp);
  const sigmaDown = rollingStd(pHistoryDown);

  const pLowUp = modelUp != null ? clamp(modelUp - Z_90 * sigmaUp, 0, 1) : null;
  const pLowDown =
    modelDown != null ? clamp(modelDown - Z_90 * sigmaDown, 0, 1) : null;

  const rawEdgeUp = modelUp != null ? modelUp - qUp : null;
  const rawEdgeDown = modelDown != null ? modelDown - qDown : null;

  const uncertaintyDiscountUp =
    modelUp != null ? (modelUp - pLowUp) : null;
  const uncertaintyDiscountDown =
    modelDown != null ? (modelDown - pLowDown) : null;

  const edgeLowUp = pLowUp != null ? pLowUp - qUp : null;
  const edgeLowDown = pLowDown != null ? pLowDown - qDown : null;

  const spreadCost = spread != null ? spread * spreadPenaltyFactor : 0.01;
  const execCostUp = feePct + slippagePct + spreadCost;
  const execCostDown = feePct + slippagePct + spreadCost;

  const robustEdgeUp =
    edgeLowUp != null
      ? clamp(edgeLowUp * timeMult - execCostUp, -1, 1)
      : null;
  const robustEdgeDown =
    edgeLowDown != null
      ? clamp(edgeLowDown * timeMult - execCostDown, -1, 1)
      : null;

  const robustRoiUp = qUp > 0.001 ? (robustEdgeUp ?? 0) / qUp : null;
  const robustRoiDown = qDown > 0.001 ? (robustEdgeDown ?? 0) / qDown : null;

  const kellyUp =
    qUp < 0.999 && edgeLowUp != null
      ? edgeLowUp / (1 - qUp)
      : null;
  const kellyDown =
    qDown < 0.999 && edgeLowDown != null
      ? edgeLowDown / (1 - qDown)
      : null;

  const bestSide =
    (robustEdgeUp ?? -1) >= (robustEdgeDown ?? -1) ? "UP" : "DOWN";
  const bestRobustEdge = bestSide === "UP" ? robustEdgeUp : robustEdgeDown;
  const bestRobustRoi = bestSide === "UP" ? robustRoiUp : robustRoiDown;
  const bestKelly = bestSide === "UP" ? kellyUp : kellyDown;

  let decision = "PASS";
  let reason = "";

  if (bestRobustEdge <= 0) {
    reason = "robust_edge_not_positive";
  } else if ((bestRobustRoi ?? 0) < minRobustRoi) {
    reason = "robust_roi_below_threshold";
  } else if (timeMult < minTimeMult) {
    reason = "time_mult_below_threshold";
  } else if ((bestKelly ?? 0) * 100 < minKellyPctBankroll * 100) {
    reason = "kelly_below_minimum";
  } else {
    decision = "BUY";
    reason = "robust_criteria_met";
  }

  const interpretation =
    decision === "BUY"
      ? `Robust edge on ${bestSide}: +${((bestRobustEdge ?? 0) * 100).toFixed(1)}% after adjustments.`
      : `PASS: ${reason.replace(/_/g, " ")}.`;

  return {
    side: decision === "BUY" ? bestSide : null,
    decision,
    reason,
    rawEdgeUp,
    rawEdgeDown,
    uncertaintyDiscountUp,
    uncertaintyDiscountDown,
    pLowUp,
    pLowDown,
    edgeLowUp,
    edgeLowDown,
    timeMult,
    execCostUp,
    execCostDown,
    robustEdgeUp,
    robustEdgeDown,
    robustRoiUp,
    robustRoiDown,
    kellyUp,
    kellyDown,
    sigmaUp,
    sigmaDown,
    interpretation
  };
}
