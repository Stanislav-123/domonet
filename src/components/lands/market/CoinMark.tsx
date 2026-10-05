"use client";

const COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#14f195",
  BNB: "#f3ba2f",
  XRP: "#23292f",
  TON: "#0098ea",
  USDT: "#26a17b",
  AVAX: "#e84142",
};

export function CoinMark({ ticker, size = 28 }: { ticker: string; size?: number }) {
  const bg = COLORS[ticker] || "#ff5a1f";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-black"
      style={{ width: size, height: size, background: bg, color: ticker === "XRP" ? "#fff" : "#111" }}
    >
      {ticker.slice(0, 3)}
    </span>
  );
}
