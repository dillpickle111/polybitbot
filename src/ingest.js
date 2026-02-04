/**
 * Builds the ingest payload for the Bloomberg terminal UI.
 * Maps bot state to { ts, market, prices, liquidity, chainlinkPrice, binancePrice, indicators, recommendation, sparkline }.
 */
export function buildIngestPayload(vars) {
  const state = vars.state;
  const sparklineData = vars.sparklineData ?? null;
  const spread = vars.spread ?? null;

  return {
    ts: state.timestamp,
    market: {
      slug: state.market?.slug ?? null,
      title: state.market?.title ?? null,
      timeLeftSec: state.market?.timeLeftSec ?? null,
      spread
    },
    prices: {
      up: state.prices?.up ?? null,
      down: state.prices?.down ?? null
    },
    liquidity: state.prices?.liquidity ?? null,
    chainlinkPrice: state.strike?.currentPrice ?? null,
    binancePrice: state.binance?.spot ?? null,
    binanceDiffUsd: state.binance?.spotDiffUsd ?? null,
    binanceDiffPct: state.binance?.spotDiffPct ?? null,
    strike: state.strike ?? null,
    indicators: {
      rsi: state.ta?.rsi ?? null,
      rsiSlope: state.ta?.rsiSlope ?? null,
      macd: state.ta?.macd ?? null,
      heikenAshi: state.ta?.heikenAshi ?? null,
      vwap: state.ta?.vwap ?? null,
      vwapDistPct: state.ta?.vwapDistPct ?? null,
      vwapSlope: state.ta?.vwapSlope ?? null,
      delta1m: state.ta?.delta1m ?? null,
      delta3m: state.ta?.delta3m ?? null
    },
    recommendation: state.betAdvantage ?? null,
    predict: state.predict ?? null,
    regime: state.regime ?? null,
    session: state.session ?? null,
    etTime: state.etTime ?? null,
    sparkline: sparklineData
  };
}
