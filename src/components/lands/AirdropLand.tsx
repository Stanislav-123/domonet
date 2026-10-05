"use client";

import { useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinMark } from "./market/CoinMark";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

const CHAINS = ["ETH", "SOL", "TON"] as const;

export function AirdropLand(props: Props) {
  const { t } = useT();
  const [chain, setChain] = useState<(typeof CHAINS)[number]>("ETH");
  const [checked, setChecked] = useState(false);
  const [alloc, setAlloc] = useState(0);

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("drop.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("drop.title")}</h1>
      <p className="mt-3 text-[var(--dim)]">{t("drop.text")}</p>
      <p className="mt-2 text-sm text-[var(--dim)]">{t("drop.text2")}</p>

      <div className="mt-6 flex gap-2">
        {CHAINS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setChain(c);
              setChecked(false);
            }}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-sm ${
              chain === c ? "border-[var(--signal)]" : "border-[var(--line)]"
            }`}
          >
            <CoinMark ticker={c} size={20} />
            {c}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={() => {
            setAlloc(800 + Math.floor(Math.random() * 3400));
            setChecked(true);
          }}
          className="btn mt-5"
        >
          {t("drop.check")}
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="panel p-4">
            <p className="kicker">{t("drop.ok")}</p>
            <p className="mt-2 font-mono text-3xl text-[var(--ok)]">{alloc.toLocaleString()} NEX</p>
            <p className="mt-2 text-sm text-[var(--dim)]">{t("drop.okText", { chain })}</p>
          </div>
          <LeadForm {...props} cta={t("drop.cta")} onFocus={props.onFormStart} />
        </div>
      )}
    </LanderFrame>
  );
}
