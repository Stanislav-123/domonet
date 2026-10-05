"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { LanderStatsBlock, type GeoStatRow, type LanderStatRow } from "@/components/stats/LanderStatsBlock";

type Overview = {
  clicks: number;
  uniques: number;
  leads: number;
  uniqueToLead: number;
  sales: number;
  confirmed: number;
  crLeadToSale: number;
};

export default function CabinetHome() {
  const { t } = useT();
  const [days, setDays] = useState(7);
  const [data, setData] = useState<{
    overview: Overview;
    landers: LanderStatRow[];
    landerGeo: GeoStatRow[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/stats?days=${days}`)
      .then((r) => r.json())
      .then(setData);
  }, [days]);

  if (!data) return <p className="text-[var(--dim)]">…</p>;
  const o = data.overview;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("cab.stats")}</h1>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="field w-auto">
          <option value={7}>7d</option>
          <option value={14}>14d</option>
          <option value={30}>30d</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          [t("metric.clicks"), o.clicks],
          [t("metric.uniques"), o.uniques],
          [t("metric.leads"), o.leads],
          [t("metric.unique2lead"), `${o.uniqueToLead}%`],
          [t("metric.sales"), o.sales ?? o.confirmed],
          [t("metric.crSale"), `${o.crLeadToSale}%`],
        ].map(([k, v]) => (
          <div key={String(k)} className="panel p-3">
            <p className="text-[11px] text-[var(--dim)]">{k}</p>
            <p className="mono mt-1 text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <LanderStatsBlock landers={data.landers} geo={data.landerGeo || []} />
    </div>
  );
}
