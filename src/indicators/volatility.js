/**
 * Short-term realized volatility from 1m candle closes.
 * Returns std dev of log returns (per 1m), or null if insufficient data.
 * @param {number[]} closes - Close prices (oldest first)
 * @param {number} lookbackMinutes - Number of 1m candles to use (default 20)
 * @returns {number|null} - Realized vol (std of 1m log returns)
 */
export function computeRealizedVol(closes, lookbackMinutes = 20) {
  if (!Array.isArray(closes) || closes.length < lookbackMinutes + 1) return null;

  const slice = closes.slice(-(lookbackMinutes + 1));
  const returns = [];
  for (let i = 1; i < slice.length; i += 1) {
    const r = Math.log(slice[i] / slice[i - 1]);
    if (Number.isFinite(r)) returns.push(r);
  }
  if (returns.length < 2) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1);
  const std = Math.sqrt(variance);
  return Number.isFinite(std) ? std : null;
}
