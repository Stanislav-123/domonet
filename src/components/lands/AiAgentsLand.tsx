"use client";

import { useMemo } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinMark } from "./market/CoinMark";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { MARKET_TICKERS, type MarketTicker } from "@/lib/market-prices";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

const NAMES: Record<MarketTicker, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "XRP",
  TON: "Toncoin",
};

export function AiAgentsLand(props: Props) {
  const { t, locale } = useT();
  const market = useMarketPrices();
  const coins = useMemo(
    () =>
      MARKET_TICKERS.map((ticker) => ({
        t: ticker,
        name: NAMES[ticker],
        last: market.prices[ticker],
        chg: market.change24h[ticker] || 0,
      })),
    [market.prices, market.change24h],
  );
  return (
    <LanderFrame wide ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("ai.kicker")}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight">{t("ai.title")}</h1>
      <p className="mt-4 max-w-2xl text-[var(--dim)]">{t("ai.text")}</p>
      <p className="mt-3 max-w-2xl text-sm text-[var(--dim)]">{t("ai.text2")}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [t("ai.stat1v"), t("ai.stat1")],
          [t("ai.stat2v"), t("ai.stat2")],
          [t("ai.stat3v"), t("ai.stat3")],
        ].map(([v, k]) => (
          <div key={String(k)} className="panel p-4">
            <p className="mono text-2xl text-[var(--signal)]">{v}</p>
            <p className="mt-1 text-sm text-[var(--dim)]">{k}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">{t("ai.markets")}</h2>
        <p className="mt-1 text-sm text-[var(--dim)]">{t("ai.marketsText")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {coins.map((c) => (
            <div key={c.t} className="panel flex items-center gap-3 p-3">
              <CoinMark ticker={c.t} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="mono text-xs text-[var(--dim)]">{c.t}/USDT</p>
              </div>
              <div className="text-right">
                <p className="mono text-sm">
                  {c.last >= 100 ? c.last.toLocaleString(locale, { maximumFractionDigits: 0 }) : c.last.toFixed(c.last < 2 ? 4 : 2)}
                </p>
                <p className={`mono text-xs ${c.chg >= 0 ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
                  {c.chg >= 0 ? "+" : ""}
                  {c.chg.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">{t("ai.how")}</h2>
          <div className="mt-4 space-y-4 text-sm text-[var(--dim)]">
            <p>01 · {t("ai.s1")}</p>
            <p>{t("ai.s1d")}</p>
            <p>02 · {t("ai.s2")}</p>
            <p>{t("ai.s2d")}</p>
            <p>03 · {t("ai.s3")}</p>
            <p>{t("ai.s3d")}</p>
          </div>
        </div>
        <div>
          <p className="kicker">{t("ai.reg")}</p>
          <h2 className="mt-1 text-2xl font-semibold">{t("ai.regTitle")}</h2>
          <p className="mt-2 mb-4 text-sm text-[var(--dim)]">{t("ai.regText")}</p>
          <LeadForm {...props} cta={t("ai.cta")} onFocus={props.onFormStart} />
        </div>
      </div>
    </LanderFrame>
  );
}
