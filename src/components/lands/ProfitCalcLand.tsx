"use client";

import { useMemo, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { CoinTicker } from "./market/CoinTicker";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

export function ProfitCalcLand(props: Props) {
  const { t, locale } = useT();
  const [deposit, setDeposit] = useState(1000);
  const [months, setMonths] = useState(6);
  const [showForm, setShowForm] = useState(false);
  const result = useMemo(() => {
    let v = deposit;
    const pts = [v];
    for (let i = 0; i < months; i++) {
      v *= 1.09;
      pts.push(Math.round(v));
    }
    return pts;
  }, [deposit, months]);
  const last = result[result.length - 1] ?? deposit;
  const profit = last - deposit;

  return (
    <LanderFrame ticker={<div className="px-4 pt-3"><CoinTicker /></div>}>
      <p className="kicker">{t("calc.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("calc.title")}</h1>
      <p className="mt-3 text-[var(--dim)]">{t("calc.text")}</p>
      <p className="mt-3 text-sm text-[var(--dim)]">{t("calc.text2")}</p>
      <p className="mt-2 text-sm text-[var(--dim)]">{t("calc.text3")}</p>

      <div className="panel mt-6 space-y-5 p-4">
        <p className="text-sm">{t("calc.what")}</p>
        <label className="block text-sm">
          {t("calc.deposit")}: <span className="mono">{deposit.toLocaleString(locale)}</span>
          <input
            type="range"
            min={250}
            max={10000}
            step={50}
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--signal)]"
          />
        </label>
        <label className="block text-sm">
          {t("calc.months")}: <span className="mono">{months}</span>
          <input
            type="range"
            min={1}
            max={12}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--signal)]"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="border border-[var(--line)] px-3 py-2">
            <p className="text-[var(--dim)]">{t("calc.result")}</p>
            <p className="mono mt-1">{last.toLocaleString(locale)} USDT</p>
          </div>
          <div className="border border-[var(--line)] px-3 py-2">
            <p className="text-[var(--dim)]">{t("calc.profit")}</p>
            <p className="mono mt-1 text-[var(--ok)]">+{profit.toLocaleString(locale)}</p>
          </div>
        </div>
        <div className="flex h-14 items-end gap-px">
          {result.map((v, i) => (
            <div key={i} className="flex-1 bg-[var(--signal)]" style={{ height: `${Math.max(10, (v / last) * 100)}%` }} />
          ))}
        </div>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn w-full">
            {t("calc.go")}
          </button>
        ) : null}
      </div>
      {showForm ? (
        <div className="mt-5">
          <p className="mb-3 text-sm text-[var(--dim)]">{t("calc.formHint")}</p>
          <LeadForm {...props} cta={t("calc.cta")} onFocus={props.onFormStart} />
        </div>
      ) : null}
    </LanderFrame>
  );
}
