/**
 * Structured BotState built from the same variables used for terminal rendering.
 * Consumed by the Next.js visualizer via WebSocket (no terminal parsing).
 *
 * @typedef {Object} BotState
 * @property {string} timestamp - ISO string
 * @property {{ slug: string|null, title: string|null, timeLeftSec: number|null }} market
 * @property {{ up: number|null, down: number|null, liquidity: number|null }} prices
 * @property {{ priceToBeat: number|null, currentPrice: number|null, diff: number|null }} strike
 * @property {{ longPct: number|null, shortPct: number|null }} predict
 * @property {{ heikenAshi: { color: string|null, count: number|null }, rsi: number|null, macd: { bias: string|null, label: string|null }, delta1m: number|null, delta3m: number|null, vwap: number|null, vwapSlope: string|null }} ta
 * @property {{ action: string|null, side: string|null, interpretation: string|null, phase: string|null }} betAdvantage
 * @property {string|null} regime
 * @property {string|null} session
 * @property {string|null} etTime
 */

/**
 * Build BotState from the same variables used in the main loop for terminal rendering.
 * @param {Object} vars - All named variables from the render tick
 * @returns {BotState}
 */
export function buildBotState(vars) {
  const {
    timeLeftMin,
    poly,
    regimeInfo,
    pLong,
    pShort,
    consec,
    rsiNow,
    rsiSlope,
    macdLabel,
    macd,
    delta1m,
    delta3m,
    vwapNow,
    vwapDist,
    vwapSlopeLabel,
    rec,
    marketUp,
    marketDown,
    liquidity,
    spread,
    sparklineData,
    priceToBeat,
    currentPrice,
    ptbDelta,
    spotPrice,
    getBtcSession,
    fmtEtTime,
    edgeQuality,
    robustEdge
  } = vars;

  const timeLeftSec = timeLeftMin != null && Number.isFinite(timeLeftMin) ? Math.max(0, Math.floor(timeLeftMin * 60)) : null;

  return {
    timestamp: new Date().toISOString(),
    market: {
      slug: poly?.ok ? (poly.market?.slug ?? null) : null,
      title: poly?.ok ? (poly.market?.question ?? null) : null,
      timeLeftSec
    },
    prices: {
      up: marketUp ?? null,
      down: marketDown ?? null,
      liquidity: liquidity ?? null,
      spread: spread ?? null
    },
    sparkline: sparklineData ?? null,
    strike: {
      priceToBeat: priceToBeat ?? null,
      currentPrice: currentPrice ?? null,
      diff: ptbDelta ?? null
    },
    predict: {
      longPct: pLong ?? null,
      shortPct: pShort ?? null
    },
    ta: {
      heikenAshi: {
        color: consec?.color ?? null,
        count: consec?.count ?? null
      },
      rsi: rsiNow ?? null,
      rsiSlope: rsiSlope ?? null,
      macd: {
        bias: macd?.hist != null ? (macd.hist > 0 ? "bullish" : "bearish") : null,
        label: macdLabel ?? null
      },
      delta1m: delta1m ?? null,
      delta3m: delta3m ?? null,
      vwap: vwapNow ?? null,
      vwapDistPct: vwapDist != null && Number.isFinite(vwapDist) ? vwapDist * 100 : null,
      vwapSlope: vwapSlopeLabel ?? null
    },
    betAdvantage: {
      action: rec?.action ?? null,
      side: rec?.side ?? null,
      interpretation: rec?.interpretation ?? null,
      phase: rec?.phase ?? null,
      strength: rec?.strength ?? null
    },
    binance: (() => {
      const spot = spotPrice ?? null;
      const diffUsd =
        currentPrice != null && spot != null && Number.isFinite(currentPrice) && Number.isFinite(spot) && currentPrice !== 0
          ? spot - currentPrice
          : null;
      const diffPct =
        diffUsd != null && currentPrice != null && currentPrice !== 0
          ? (diffUsd / currentPrice) * 100
          : null;
      return { spot, spotDiffUsd: diffUsd, spotDiffPct: diffPct };
    })(),
    regime: regimeInfo?.regime ?? null,
    session: typeof getBtcSession === "function" ? getBtcSession(new Date()) : null,
    etTime: typeof fmtEtTime === "function" ? fmtEtTime(new Date()) : null,
    edgeQuality: edgeQuality ?? null,
    robustEdge: robustEdge ?? null
  };
}
