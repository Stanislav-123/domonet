"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useT } from "@/components/i18n/I18nProvider";
import { LanderStatsBlock, type GeoStatRow, type LanderStatRow } from "@/components/stats/LanderStatsBlock";

type Overview = {
  clicks: number;
  uniques: number;
  backButton: number;
  exitShown: number;
  exitClicked: number;
  landViews: number;
  formStarts: number;
  leads: number;
  confirmed: number;
  duplicates: number;
  uniqueToLead: number;
  sales: number;
  crLeadToSale: number;
};

export function DashboardClient() {
  const { t } = useT();
  const [days, setDays] = useState(7);
  const [data, setData] = useState<{
    overview: Overview;
    landers: LanderStatRow[];
    daily: { date: string; clicks: number; leads: number; confirmed: number }[];
    landerGeo: GeoStatRow[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/stats?days=${days}`)
      .then(async (r) => {
        const d = await r.json();
        if (!d?.overview) throw new Error(d?.error || "stats");
        setData(d);
      })
      .catch(() => undefined);
  }, [days]);

  const cards = useMemo(() => {
    if (!data) return [];
    const o = data.overview;
    return [
      [t("metric.clicks"), o.clicks],
      [t("metric.uniques"), o.uniques],
      [t("metric.leads"), o.leads],
      [t("metric.unique2lead"), `${o.uniqueToLead}%`],
      [t("metric.sales"), o.sales ?? o.confirmed],
      [t("metric.crSale"), `${o.crLeadToSale}%`],
      [t("metric.back"), o.backButton],
      [t("metric.exitClick"), o.exitClicked],
    ];
  }, [data, t]);

  if (!data?.overview) return <p className="text-[var(--dim)]">…</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("admin.dash")}</h1>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="field w-auto">
          <option value={1}>1d</option>
          <option value={7}>7d</option>
          <option value={14}>14d</option>
          <option value={30}>30d</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="panel p-3">
            <p className="text-[11px] text-[var(--dim)]">{label}</p>
            <p className="mono mt-1 text-2xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="panel h-64 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.daily}>
            <CartesianGrid stroke="#2b2b2b" />
            <XAxis dataKey="date" stroke="#8f8a82" fontSize={11} />
            <YAxis stroke="#8f8a82" fontSize={11} />
            <Tooltip />
            <Area type="monotone" dataKey="clicks" stroke="#ece8e1" fill="rgba(236,232,225,0.08)" />
            <Area type="monotone" dataKey="leads" stroke="#ff5a1f" fill="rgba(255,90,31,0.15)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <LanderStatsBlock landers={data.landers} geo={data.landerGeo || []} />
    </div>
  );
}
