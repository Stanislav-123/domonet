export const MARKET_TICKERS = ["BTC", "ETH", "SOL", "BNB", "XRP", "TON"] as const;
export type MarketTicker = (typeof MARKET_TICKERS)[number];

export type MarketPrice = {
  ticker: MarketTicker;
  price: number;
  change24h: number;
};

/** Fallback if Binance is unreachable */
export const FALLBACK_PRICES: Record<MarketTicker, number> = {
  BTC: 78500,
  ETH: 3400,
  SOL: 180,
  BNB: 650,
  XRP: 2.4,
  TON: 5.5,
};

export const BINANCE_SYMBOL: Record<MarketTicker, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
  XRP: "XRPUSDT",
  TON: "TONUSDT",
};

export function volForPrice(price: number) {
  // Tiny visual jitter only (~0.005–0.02%)
  return Math.max(0.00001, price * 0.00008);
}
