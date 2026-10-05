"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { countryName } from "@/lib/countries";

export type LanderStatRow = {
  lander: { id: string; name: string };
  clicks: number;
  uniques: number;
  leads: number;
  uniqueToLead?: number;
  sales?: number;
  confirmed?: number;
  crLeadToSale?: number;
};

export type GeoStatRow = {
  landerId: string | null;
  landerName: string;
  country: string;
  clicks: number;
  uniques: number;
  leads: number;
  uniqueToLead: number;
  sales: number;
  cr: number;
};

function pct(n?: number) {
  return `${n ?? 0}%`;
}

function MetricsTable({
  rows,
  labelHeader,
}: {
  rows: { key: string; label: string; clicks: number; uniques: number; leads: number; uniqueToLead: number; sales: number; cr: number }[];
  labelHeader: string;
}) {
  const { t } = useT();
  return (
    <div className="panel overflow-x-auto">
      <table className="data">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            <th>{t("metric.clicks")}</th>
            <th>{t("metric.uniques")}</th>
            <th>{t("metric.leads")}</th>
            <th>{t("metric.unique2lead")}</th>
            <th>{t("metric.sales")}</th>
            <th>{t("metric.crSale")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td className="mono">{r.clicks}</td>
              <td className="mono">{r.uniques}</td>
              <td className="mono">{r.leads}</td>
              <td className="mono">{pct(r.uniqueToLead)}</td>
              <td className="mono">{r.sales}</td>
              <td className="mono">{pct(r.cr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LanderStatsBlock({
  landers,
  geo,
}: {
  landers: LanderStatRow[];
  geo: GeoStatRow[];
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"lander" | "country">("lander");
  const [landerId, setLanderId] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!landerId && landers[0]) setLanderId(landers[0].lander.id);
  }, [landers, landerId]);
  useEffect(() => {
    if (!country && geo[0]) setCountry(geo[0].country);
  }, [geo, country]);

  const landerRows = useMemo(
    () =>
      landers.map((r) => ({
        key: r.lander.id,
        label: r.lander.name,
        clicks: r.clicks,
        uniques: r.uniques,
        leads: r.leads,
        uniqueToLead: r.uniqueToLead ?? 0,
        sales: r.sales ?? r.confirmed ?? 0,
        cr: r.crLeadToSale ?? 0,
      })),
    [landers],
  );

  const countries = useMemo(() => {
    const set = new Set(geo.map((g) => g.country));
    return [...set].sort();
  }, [geo]);

  const splitRows = useMemo(() => {
    if (mode === "lander") {
      return geo
        .filter((g) => g.landerId === landerId)
        .map((g) => ({
          key: `${g.landerId}-${g.country}`,
          label: countryName(g.country),
          clicks: g.clicks,
          uniques: g.uniques,
          leads: g.leads,
          uniqueToLead: g.uniqueToLead,
          sales: g.sales,
          cr: g.cr,
        }));
    }
    return geo
      .filter((g) => g.country === country)
      .map((g) => ({
        key: `${g.landerId}-${g.country}`,
        label: g.landerName,
        clicks: g.clicks,
        uniques: g.uniques,
        leads: g.leads,
        uniqueToLead: g.uniqueToLead,
        sales: g.sales,
        cr: g.cr,
      }));
  }, [geo, mode, landerId, country]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-lg">{t("admin.landers")}</h2>
        <MetricsTable rows={landerRows} labelHeader={t("table.lander")} />
      </section>
      <section className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">{t("geo.title")}</h2>
            <p className="mt-1 text-sm text-[var(--dim)]">{t("geo.hint")}</p>
          </div>
          <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => setOpen((v) => !v)}>
            {open ? t("geo.close") : t("geo.open")}
          </button>
        </div>
        {open ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={mode === "lander" ? "btn text-sm" : "btn-ghost px-3 py-2 text-sm"}
                onClick={() => setMode("lander")}
              >
                {t("geo.byLander")}
              </button>
              <button
                type="button"
                className={mode === "country" ? "btn text-sm" : "btn-ghost px-3 py-2 text-sm"}
                onClick={() => setMode("country")}
              >
                {t("geo.byCountry")}
              </button>
              {mode === "lander" ? (
                <select value={landerId} onChange={(e) => setLanderId(e.target.value)} className="field w-auto">
                  {landers.map((l) => (
                    <option key={l.lander.id} value={l.lander.id}>
                      {l.lander.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="field w-auto">
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {countryName(c)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <MetricsTable
              rows={splitRows}
              labelHeader={mode === "lander" ? t("table.country") : t("table.lander")}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
