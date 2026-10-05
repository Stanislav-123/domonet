"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { FALLBACK_PRICES, volForPrice } from "@/lib/market-prices";

type Props = {
  landerId: string;
  clickId?: string | null;
  country?: string | null;
  onFormStart?: () => void;
  mode: "line" | "candles";
};

type Candle = { o: number; h: number; l: number; c: number };

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function nextAroundLive(live: number, prev: number, volMul = 1) {
  const pull = (live - prev) * 0.35;
  const noise = rnd(-volForPrice(live) * volMul, volForPrice(live) * volMul);
  // Hard clamp: never drift more than 0.15% from live quote
  const next = prev + pull + noise;
  const maxDev = live * 0.0015;
  return Math.min(live + maxDev, Math.max(live - maxDev, next));
}

function seedLine(n = 90, start = FALLBACK_PRICES.BTC) {
  const amp = start * 0.0008;
  const pts = [start];
  for (let i = 1; i < n; i++) {
    pts.push(start + Math.sin(i / 7) * amp + Math.cos(i / 13) * (amp * 0.35));
  }
  return pts;
}

function toCandles(pts: number[], size = 3): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < pts.length; i += size) {
    const slice = pts.slice(i, i + size);
    const o = slice[0]!;
    const c = slice[slice.length - 1]!;
    out.push({ o, c, h: Math.max(...slice), l: Math.min(...slice) });
  }
  return out;
}

function bookLevels(price: number, side: "bid" | "ask") {
  const step = Math.max(1, price * 0.00018);
  return Array.from({ length: 6 }, (_, i) => {
    const dist = (i + 1) * step;
    const px = side === "bid" ? price - dist : price + dist;
    return { px, sz: 0.18 + i * 0.33 };
  });
}

export function PriceCallLand(props: Props) {
  const { t, locale } = useT();
  const market = useMarketPrices();
  const [phase, setPhase] = useState<"pick" | "wait" | "win">("pick");
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const [left, setLeft] = useState(7);
  const [line, setLine] = useState(() => seedLine());
  const [candles, setCandles] = useState(() => toCandles(seedLine(96)));
  const [trades, setTrades] = useState(() => {
    const base = FALLBACK_PRICES.BTC;
    return [
      { id: "t1", side: "buy" as const, px: base, sz: 0.21 },
      { id: "t2", side: "sell" as const, px: base * 0.9999, sz: 0.08 },
      { id: "t3", side: "buy" as const, px: base * 1.0002, sz: 0.44 },
      { id: "t4", side: "sell" as const, px: base * 0.9997, sz: 0.15 },
      { id: "t5", side: "buy" as const, px: base * 1.0001, sz: 0.05 },
    ];
  });
  const strikeRef = useRef(0);
  const targetRef = useRef(0);
  const waitAt = useRef(0);
  const tickN = useRef(0);
  const priceRef = useRef(FALLBACK_PRICES.BTC);
  const liveRef = useRef(FALLBACK_PRICES.BTC);
  const seeded = useRef(false);

  useEffect(() => {
    if (!market.ready) return;
    const btc = market.prices.BTC;
    liveRef.current = btc;
    if (!seeded.current) {
      seeded.current = true;
      priceRef.current = btc;
      setLine(seedLine(90, btc));
      setCandles(toCandles(seedLine(96, btc)));
      setTrades([
        { id: "t1", side: "buy", px: btc, sz: 0.21 },
        { id: "t2", side: "sell", px: btc * 0.9999, sz: 0.08 },
        { id: "t3", side: "buy", px: btc * 1.0002, sz: 0.44 },
        { id: "t4", side: "sell", px: btc * 0.9997, sz: 0.15 },
        { id: "t5", side: "buy", px: btc * 1.0001, sz: 0.05 },
      ]);
    }
  }, [market.ready, market.prices.BTC]);

  const price = props.mode === "candles" ? candles[candles.length - 1]!.c : line[line.length - 1]!;
  priceRef.current = price;
  const prev = props.mode === "candles" ? candles[candles.length - 2]?.c ?? price : line[line.length - 2] ?? price;
  const up = price >= prev;
  const change = market.change24h.BTC || ((price - (line[0] || price)) / (line[0] || price)) * 100;

  const range = useMemo(() => {
    if (props.mode === "candles") {
      const lows = candles.map((c) => c.l);
      const highs = candles.map((c) => c.h);
      return { min: Math.min(...lows), max: Math.max(...highs) };
    }
    return { min: Math.min(...line), max: Math.max(...line) };
  }, [props.mode, candles, line]);

  const linePath = useMemo(() => {
    const { min, max } = range;
    return line
      .map((p, i) => {
        const x = (i / (line.length - 1)) * 640;
        const y = 180 - ((p - min) / (max - min || 1)) * 168;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [line, range]);

  function yOf(v: number) {
    const { min, max } = range;
    return 180 - ((v - min) / (max - min || 1)) * 168;
  }

  useEffect(() => {
    const id = setInterval(() => {
      const waiting = waitAt.current > 0;
      const elapsed = waiting ? Date.now() - waitAt.current : 0;
      const lock = waiting && elapsed > 5800;
      const live = liveRef.current;

      setLine((s) => {
        const last = s[s.length - 1]!;
        let next = nextAroundLive(live, last, 1.2);
        if (lock) {
          next = last + (targetRef.current - last) * rnd(0.2, 0.4);
          const maxDev = live * 0.004;
          next = Math.min(live + maxDev, Math.max(live - maxDev, next));
        }
        return [...s.slice(1), next];
      });

      setCandles((cs) => {
        const copy = cs.map((c) => ({ ...c }));
        const last = copy[copy.length - 1]!;
        let px = nextAroundLive(live, last.c, 1);
        if (lock) {
          px = last.c + (targetRef.current - last.c) * rnd(0.2, 0.4);
          const maxDev = live * 0.004;
          px = Math.min(live + maxDev, Math.max(live - maxDev, px));
        }
        last.c = px;
        last.h = Math.max(last.h, px);
        last.l = Math.min(last.l, px);
        tickN.current += 1;
        if (tickN.current % 5 === 0) {
          copy.push({ o: px, h: px, l: px, c: px });
          copy.shift();
        }
        return copy;
      });

      setTrades((rows) => [
        {
          id: Math.random().toString(36).slice(2),
          side: (Math.random() > 0.5 ? "buy" : "sell") as "buy" | "sell",
          px: priceRef.current,
          sz: rnd(0.01, 0.6),
        },
        ...rows,
      ].slice(0, 6));
    }, 400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== "wait") return;
    setLeft(7);
    const count = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    const done = setTimeout(() => setPhase("win"), 7200);
    return () => {
      clearInterval(count);
      clearTimeout(done);
    };
  }, [phase]);

  function pick(dir: "up" | "down") {
    setChoice(dir);
    strikeRef.current = price;
    const move = liveRef.current * rnd(0.0004, 0.0012);
    targetRef.current = dir === "up" ? price + move : price - move;
    waitAt.current = Date.now();
    setPhase("wait");
  }

  const bids = bookLevels(price, "bid");
  const asks = bookLevels(price, "ask");
  const strikeY = phase !== "pick" ? yOf(strikeRef.current) : null;

  return (
    <LanderFrame wide ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">{t("price.kicker")}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{t("price.title")}</h1>
        </div>
        <div className="text-right">
          <p className={`mono text-3xl ${up ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
            {price.toLocaleString(locale, { maximumFractionDigits: 1 })}
          </p>
          <p className={`mono text-xs ${change >= 0 ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
            BTC/USDT · {change >= 0 ? "+" : ""}
            {change.toFixed(2)}% 24h
          </p>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-[var(--dim)]">{t("price.text")}</p>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px]">
        <div className="panel p-3">
          <div className="mb-2 flex justify-between font-mono text-[11px] text-[var(--dim)]">
            <span>BTC/USDT · {props.mode === "candles" ? "1m" : "tick"}</span>
            <span>vol {(820 + Math.round(price % 90)).toFixed(0)}M</span>
          </div>
          <svg viewBox="0 0 640 180" className="h-48 w-full md:h-56">
            {props.mode === "line" ? (
              <path d={linePath} fill="none" stroke={up ? "#c6f04d" : "#ff5c5c"} strokeWidth="1.6" />
            ) : (
              candles.map((c, i) => {
                const w = 640 / candles.length;
                const x = i * w + w * 0.2;
                const bw = w * 0.55;
                const yH = yOf(c.h);
                const yL = yOf(c.l);
                const yO = yOf(c.o);
                const yC = yOf(c.c);
                const green = c.c >= c.o;
                const top = Math.min(yO, yC);
                const h = Math.max(1.2, Math.abs(yC - yO));
                const col = green ? "#c6f04d" : "#ff5c5c";
                return (
                  <g key={i}>
                    <line x1={x + bw / 2} x2={x + bw / 2} y1={yH} y2={yL} stroke={col} strokeWidth="1" />
                    <rect x={x} y={top} width={bw} height={h} fill={col} />
                  </g>
                );
              })
            )}
            {strikeY != null ? (
              <line x1="0" x2="640" y1={strikeY} y2={strikeY} stroke="#ff5a1f" strokeDasharray="4 4" strokeWidth="1" />
            ) : null}
          </svg>
        </div>
        <div className="panel overflow-hidden font-mono text-[11px]">
          <p className="border-b border-[var(--line)] px-3 py-2 text-[var(--dim)]">{t("price.book")}</p>
          {asks.slice().reverse().map((a) => (
            <div key={a.px} className="flex justify-between px-3 py-0.5 text-[var(--bad)]">
              <span>{a.px.toFixed(1)}</span>
              <span>{a.sz.toFixed(3)}</span>
            </div>
          ))}
          <div className="border-y border-[var(--line)] px-3 py-1 text-[var(--ink)]">{price.toFixed(1)}</div>
          {bids.map((b) => (
            <div key={b.px} className="flex justify-between px-3 py-0.5 text-[var(--ok)]">
              <span>{b.px.toFixed(1)}</span>
              <span>{b.sz.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 panel overflow-hidden">
        {trades.map((tr) => (
          <div key={tr.id} className="flex justify-between border-b border-[var(--line)] px-3 py-1 font-mono text-[11px] last:border-0">
            <span className={tr.side === "buy" ? "text-[var(--ok)]" : "text-[var(--bad)]"}>
              {tr.side === "buy" ? "BUY" : "SELL"}
            </span>
            <span>{tr.px.toFixed(1)}</span>
            <span className="text-[var(--dim)]">{tr.sz.toFixed(3)}</span>
          </div>
        ))}
      </div>

      {phase === "pick" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => pick("up")} className="btn btn-long">
            {t("price.up")}
          </button>
          <button onClick={() => pick("down")} className="btn btn-short">
            {t("price.down")}
          </button>
        </div>
      ) : null}
      {phase === "wait" ? (
        <p className="mt-4 font-mono text-sm text-[var(--signal)]">
          {t("price.wait", { n: left })} · {t("price.mark")} {strikeRef.current.toFixed(1)}
        </p>
      ) : null}
      {phase === "win" ? (
        <div className="mt-5 space-y-4">
          <div className="panel p-4">
            <p className="kicker">{t("price.win")}</p>
            <p className="mt-1 text-xl">{t("price.winDir", { dir: choice === "up" ? t("price.up") : t("price.down") })}</p>
            <p className="mt-2 font-mono text-sm">
              {strikeRef.current.toFixed(1)} → {price.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">{t("price.winHint")}</p>
          </div>
          <LeadForm {...props} cta={t("price.cta")} onFocus={props.onFormStart} />
        </div>
      ) : null}
    </LanderFrame>
  );
}

export function PriceGuessLand(props: Omit<Props, "mode">) {
  return <PriceCallLand {...props} mode="line" />;
}

export function PriceCandlesLand(props: Omit<Props, "mode">) {
  return <PriceCallLand {...props} mode="candles" />;
}
