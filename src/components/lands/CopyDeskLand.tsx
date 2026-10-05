"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

const DESKS = [
  { id: "n1", name: "North Desk", pair: "BTC", base: 18.4, copiers: 1240 },
  { id: "a2", name: "Atlas Grid", pair: "ETH", base: 11.2, copiers: 860 },
  { id: "s3", name: "Sol Pulse", pair: "SOL", base: 24.1, copiers: 540 },
  { id: "v4", name: "Volt Intra", pair: "BNB", base: 7.8, copiers: 410 },
];

export function CopyDeskLand(props: Props) {
  const { t, locale } = useT();
  const [pnl, setPnl] = useState(() => DESKS.map((d) => d.base));
  const [pick, setPick] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPnl((rows) => rows.map((v) => v + (Math.random() - 0.42) * 0.12));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("copy.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("copy.title")}</h1>
      <p className="mt-3 text-[var(--dim)]">{t("copy.text")}</p>
      <p className="mt-2 text-sm text-[var(--dim)]">{t("copy.text2")}</p>
      <div className="mt-6 space-y-2">
        {DESKS.map((d, i) => {
          const on = pick === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setPick(d.id)}
              className={`panel flex w-full items-center justify-between p-4 text-left ${on ? "border-[var(--signal)]" : ""}`}
            >
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-[var(--dim)]">
                  {d.pair} · {d.copiers.toLocaleString(locale)} {t("copy.copiers")}
                </p>
              </div>
              <p className={`mono text-lg ${pnl[i]! >= 0 ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>
                {pnl[i]! >= 0 ? "+" : ""}
                {pnl[i]!.toFixed(1)}%
              </p>
            </button>
          );
        })}
      </div>
      {pick ? (
        <div className="mt-5">
          <p className="mb-3 text-sm text-[var(--dim)]">{t("copy.formHint")}</p>
          <LeadForm {...props} cta={t("copy.cta")} onFocus={props.onFormStart} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--dim)]">{t("copy.pick")}</p>
      )}
    </LanderFrame>
  );
}
