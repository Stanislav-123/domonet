"use client";

import { useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";
import { useMarketPrices } from "@/hooks/useMarketPrices";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

export function BriefingLand(props: Props) {
  const { t, locale } = useT();
  const market = useMarketPrices();
  const [show, setShow] = useState(false);
  const day = new Date().toLocaleDateString(locale, { day: "2-digit", month: "short" });
  const btc = market.prices.BTC;
  const support = Math.round(btc * 0.985);
  const resist = Math.round(btc * 1.02);

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("brief.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("brief.title")}</h1>
      <p className="mt-1 font-mono text-xs text-[var(--dim)]">{day}</p>
      <p className="mt-3 text-[var(--dim)]">{t("brief.text")}</p>

      <div className="mt-6 space-y-3">
        <article className="panel p-4">
          <p className="kicker">01</p>
          <h2 className="mt-1 font-medium">{t("brief.n1t")}</h2>
          <p className="mt-2 text-sm text-[var(--dim)]">{t("brief.n1d")}</p>
        </article>
        <article className="panel p-4">
          <p className="kicker">02</p>
          <h2 className="mt-1 font-medium">{t("brief.n2t")}</h2>
          <p className="mt-2 text-sm text-[var(--dim)]">{t("brief.n2d")}</p>
        </article>
        <article className="panel p-4">
          <p className="kicker">03</p>
          <h2 className="mt-1 font-medium">{t("brief.n3t")}</h2>
          <p className="mt-2 text-sm text-[var(--dim)]">{t("brief.n3d")}</p>
        </article>
      </div>

      <div className="panel mt-4 grid grid-cols-3 gap-2 p-4 font-mono text-sm">
        <div>
          <p className="text-[11px] text-[var(--dim)]">BTC support</p>
          <p>{support.toLocaleString(locale)}</p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--dim)]">BTC resist</p>
          <p>{resist.toLocaleString(locale)}</p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--dim)]">Bias</p>
          <p className="text-[var(--ok)]">risk-on</p>
        </div>
      </div>
      {!show ? (
        <button onClick={() => setShow(true)} className="btn mt-5 w-full">
          {t("brief.go")}
        </button>
      ) : (
        <div className="mt-5">
          <LeadForm landerId={props.landerId} clickId={props.clickId} country={props.country} onFocus={props.onFormStart} />
        </div>
      )}
    </LanderFrame>
  );
}
