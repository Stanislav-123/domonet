"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinMark } from "./market/CoinMark";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

const VAULTS = [
  { id: "btc", t: "BTC", apy: 8.4 },
  { id: "eth", t: "ETH", apy: 11.2 },
  { id: "usdt", t: "USDT", apy: 14.6 },
];

export function VaultLand(props: Props) {
  const { t, locale } = useT();
  const [id, setId] = useState("usdt");
  const [amount, setAmount] = useState(2500);
  const [show, setShow] = useState(false);
  const vault = VAULTS.find((v) => v.id === id)!;
  const year = useMemo(() => Math.round(amount * (1 + vault.apy / 100)), [amount, vault.apy]);

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("vault.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("vault.title")}</h1>
      <p className="mt-3 text-[var(--dim)]">{t("vault.text")}</p>
      <p className="mt-2 text-sm text-[var(--dim)]">{t("vault.text2")}</p>

      <div className="mt-6 grid gap-2 md:grid-cols-3">
        {VAULTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setId(v.id)}
            className={`panel flex items-center gap-3 p-4 text-left ${id === v.id ? "border-[var(--signal)]" : ""}`}
          >
            <CoinMark ticker={v.t} />
            <div>
              <p className="font-medium">{v.t} {t("vault.vault")}</p>
              <p className="mono text-sm text-[var(--ok)]">{v.apy}% APY</p>
            </div>
          </button>
        ))}
      </div>

      <div className="panel mt-4 space-y-4 p-4">
        <label className="block text-sm">
          {t("vault.amount")}: <span className="mono">{amount.toLocaleString(locale)}</span>
          <input
            type="range"
            min={250}
            max={20000}
            step={50}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--signal)]"
          />
        </label>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--dim)]">{t("vault.year")}</span>
          <span className="mono">{year.toLocaleString(locale)} {vault.t === "USDT" ? "USDT" : vault.t}</span>
        </div>
        {!show ? (
          <button onClick={() => setShow(true)} className="btn w-full">
            {t("vault.go")}
          </button>
        ) : null}
      </div>
      {show ? (
        <div className="mt-5">
          <LeadForm {...props} cta={t("vault.cta")} onFocus={props.onFormStart} />
        </div>
      ) : null}
    </LanderFrame>
  );
}
