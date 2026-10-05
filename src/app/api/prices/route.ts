import { NextResponse } from "next/server";
import {
  BINANCE_SYMBOL,
  FALLBACK_PRICES,
  MARKET_TICKERS,
  type MarketPrice,
  type MarketTicker,
} from "@/lib/market-prices";

export const dynamic = "force-dynamic";

type CacheEntry = { at: number; prices: MarketPrice[] };
let cache: CacheEntry | null = null;
const TTL_MS = 10_000;

function fallbackPrices(): MarketPrice[] {
  return MARKET_TICKERS.map((ticker) => ({
    ticker,
    price: FALLBACK_PRICES[ticker],
    change24h: 0,
  }));
}

async function fetchBinance(): Promise<MarketPrice[]> {
  const symbols = JSON.stringify(MARKET_TICKERS.map((t) => BINANCE_SYMBOL[t]));
  const url = `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!res.ok) throw new Error(`binance ${res.status}`);
  const rows = (await res.json()) as { symbol: string; lastPrice: string; priceChangePercent: string }[];
  const bySymbol = new Map(rows.map((r) => [r.symbol, r]));

  return MARKET_TICKERS.map((ticker) => {
    const row = bySymbol.get(BINANCE_SYMBOL[ticker]);
    const price = row ? Number(row.lastPrice) : FALLBACK_PRICES[ticker];
    const change24h = row ? Number(row.priceChangePercent) : 0;
    return {
      ticker,
      price: Number.isFinite(price) && price > 0 ? price : FALLBACK_PRICES[ticker],
      change24h: Number.isFinite(change24h) ? change24h : 0,
    };
  });
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < TTL_MS) {
      return NextResponse.json({ prices: cache.prices, source: "cache" });
    }
    const prices = await fetchBinance();
    cache = { at: Date.now(), prices };
    return NextResponse.json({ prices, source: "binance" });
  } catch (e) {
    console.error("prices", e);
    const prices = cache?.prices || fallbackPrices();
    return NextResponse.json({ prices, source: "fallback" });
  }
}

export type { MarketTicker };
