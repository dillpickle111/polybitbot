/**
 * Time feasibility and real edge calculation.
 * When time is limited and price is far from strike, the raw edge may not be achievable.
 *
 * @param {Object} params
 * @param {number} price - Current price
 * @param {number} priceToBeat - Strike price
 * @param {number} timeLeftMin - Minutes remaining
 * @param {number} realizedVol - Std of 1m log returns (from computeRealizedVol)
 * @param {number} rawEdgeUp - Raw edge on UP (modelUp - marketUp)
 * @param {number} rawEdgeDown - Raw edge on DOWN (modelDown - marketDown)
 * @param {number} baseIntervalMin - Market window in minutes (default 15)
 * @returns {Object} edgeQuality
 */
export function computeEdgeQuality({
  price,
  priceToBeat,
  timeLeftMin,
  realizedVol,
  rawEdgeUp,
  rawEdgeDown,
  baseIntervalMin = 15
}) {
  const bestRawEdge = Math.max(rawEdgeUp ?? 0, rawEdgeDown ?? 0);

  if (
    price == null ||
    !Number.isFinite(price) ||
    priceToBeat == null ||
    !Number.isFinite(priceToBeat) ||
    timeLeftMin == null ||
    !Number.isFinite(timeLeftMin) ||
    timeLeftMin <= 0
  ) {
    return {
      rawEdgeUp,
      rawEdgeDown,
      realEdgeUp: rawEdgeUp,
      realEdgeDown: rawEdgeDown,
      timeMultiplier: 1,
      expectedMove: null,
      distanceToStrike: null,
      zScore: null,
      moveProbability: null,
      note: null
    };
  }

  const distanceToStrike = Math.abs(priceToBeat - price);

  let expectedMove = null;
  let zScore = null;
  let timeMultiplier = 1;

  if (
    realizedVol != null &&
    Number.isFinite(realizedVol) &&
    realizedVol > 0
  ) {
    expectedMove =
      price * realizedVol * Math.sqrt(timeLeftMin / baseIntervalMin);
    zScore =
      expectedMove > 0 ? distanceToStrike / expectedMove : null;
  }

  if (zScore != null && Number.isFinite(zScore)) {
    if (zScore < 0.5) timeMultiplier = 1.0;
    else if (zScore < 1) timeMultiplier = 0.7;
    else if (zScore < 2) timeMultiplier = 0.35;
    else timeMultiplier = 0.1;
  }

  const realEdgeUp =
    rawEdgeUp != null && Number.isFinite(rawEdgeUp)
      ? rawEdgeUp * timeMultiplier
      : rawEdgeUp;
  const realEdgeDown =
    rawEdgeDown != null && Number.isFinite(rawEdgeDown)
      ? rawEdgeDown * timeMultiplier
      : rawEdgeDown;

  let moveProbability = null;
  if (zScore != null && Number.isFinite(zScore)) {
    if (zScore < 0.5) moveProbability = "High";
    else if (zScore < 1) moveProbability = "Moderate";
    else moveProbability = "Low";
  }

  let note = null;
  if (
    timeLeftMin < 5 &&
    bestRawEdge > 0.02 &&
    timeMultiplier < 0.5
  ) {
    note = "Edge is theoretical due to limited time remaining.";
  }

  return {
    rawEdgeUp,
    rawEdgeDown,
    realEdgeUp,
    realEdgeDown,
    timeMultiplier,
    expectedMove,
    distanceToStrike,
    zScore,
    moveProbability,
    note
  };
}
