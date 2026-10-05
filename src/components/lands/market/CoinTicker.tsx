"use client";

import { MARKET_TICKERS, type MarketTicker } from "@/lib/market-prices";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { CoinMark } from "./CoinMark";

function fmt(ticker: MarketTicker, price: number) {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 100) return price.toFixed(1);
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

export function CoinTicker() {
  const market = useMarketPrices();

  return (
    <div className="mb-6 flex gap-5 overflow-x-auto border border-[var(--line)] bg-black/40 px-3 py-2">
      {MARKET_TICKERS.map((t) => {
        const last = market.prices[t];
        const chg = market.change24h[t] || 0;
        return (
          <span key={t} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
            <CoinMark ticker={t} size={18} />
            <span>{t}</span>
            <span>{fmt(t, last)}</span>
            <span className={chg >= 0 ? "text-[var(--ok)]" : "text-[var(--bad)]"}>
              {chg >= 0 ? "+" : ""}
              {chg.toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}
