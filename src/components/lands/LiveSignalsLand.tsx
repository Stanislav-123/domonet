"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

const pairs = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "TONUSDT"];

function randomTrade(locale: string) {
  const pair = pairs[Math.floor(Math.random() * pairs.length)] ?? "BTCUSDT";
  const side = Math.random() > 0.45 ? "LONG" : "SHORT";
  const pnl = (Math.random() * 3.8 + 0.2) * (Math.random() > 0.18 ? 1 : -1);
  return {
    id: Math.random().toString(36).slice(2),
    pair,
    side,
    pnl,
    time: new Date().toLocaleTimeString(locale),
  };
}

export function LiveSignalsLand(props: Props) {
  const { t, locale } = useT();
  const [trades, setTrades] = useState(() => Array.from({ length: 6 }, () => randomTrade(locale)));
  const [showForm, setShowForm] = useState(false);
  const [signal] = useState(() => ({
    pair: "ETHUSDT",
    side: "LONG",
    entry: 3482.4,
    sl: 3410,
    tp: 3590,
    rr: "1 : 2.1",
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setTrades((rows) => [randomTrade(locale), ...rows].slice(0, 8));
    }, 1800);
    return () => clearInterval(id);
  }, [locale]);

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("live.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("live.title")}</h1>
      <p className="mt-3 text-[var(--dim)]">{t("live.text")}</p>
      <p className="mt-2 text-sm text-[var(--dim)]">{t("live.text2")}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs text-[var(--dim)]">{t("live.win")}</p>
          <p className="mono mt-1 text-2xl">68.4%</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-[var(--dim)]">{t("live.avg")}</p>
          <p className="mono mt-1 text-2xl">+1.7%</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-[var(--dim)]">{t("live.openN")}</p>
          <p className="mono mt-1 text-2xl">3</p>
        </div>
      </div>

      <div className="panel mt-4 p-4">
        <p className="kicker">{t("live.open")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mono text-xl">{signal.pair}</p>
            <p className="text-[var(--ok)]">{signal.side}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-[11px] text-[var(--dim)]">Entry</p>
              <p>{signal.entry}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--dim)]">SL</p>
              <p className="text-[var(--bad)]">{signal.sl}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--dim)]">TP</p>
              <p className="text-[var(--ok)]">{signal.tp}</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--dim)]">{t("live.openHint", { rr: signal.rr })}</p>
      </div>

      <div className="panel mt-4 overflow-hidden">
        <p className="border-b border-[var(--line)] px-4 py-2 text-xs text-[var(--dim)]">{t("live.tape")}</p>
        {trades.map((row) => (
          <div key={row.id} className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5 last:border-0">
            <div>
              <p className="mono text-sm">{row.pair}</p>
              <p className="text-[11px] text-[var(--dim)]">{row.time}</p>
            </div>
            <span className={row.side === "LONG" ? "text-[var(--ok)]" : "text-[var(--bad)]"}>{row.side}</span>
            <span className={`mono ${row.pnl >= 0 ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
              {row.pnl >= 0 ? "+" : ""}
              {row.pnl.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn mt-5 w-full">
          {t("live.go")}
        </button>
      ) : (
        <div className="mt-5">
          <LeadForm {...props} cta={t("live.cta")} onFocus={props.onFormStart} />
        </div>
      )}
    </LanderFrame>
  );
}
