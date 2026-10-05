"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_PRICES,
  MARKET_TICKERS,
  type MarketPrice,
  type MarketTicker,
} from "@/lib/market-prices";

type State = {
  prices: Record<MarketTicker, number>;
  change24h: Record<MarketTicker, number>;
  ready: boolean;
};

const initial: State = {
  prices: { ...FALLBACK_PRICES },
  change24h: Object.fromEntries(MARKET_TICKERS.map((t) => [t, 0])) as Record<MarketTicker, number>,
  ready: false,
};

/** Live market quotes from /api/prices (Binance), refreshed often. */
export function useMarketPrices(refreshMs = 12_000) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        const data = await res.json();
        const list = (data.prices || []) as MarketPrice[];
        if (!alive || !list.length) return;
        const prices = { ...FALLBACK_PRICES };
        const change24h = { ...initial.change24h };
        for (const row of list) {
          if ((MARKET_TICKERS as readonly string[]).includes(row.ticker)) {
            prices[row.ticker as MarketTicker] = row.price;
            change24h[row.ticker as MarketTicker] = row.change24h;
          }
        }
        setState({ prices, change24h, ready: true });
      } catch {
        if (alive) setState((s) => ({ ...s, ready: true }));
      }
    }

    load();
    const id = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [refreshMs]);

  return state;
}
