"use client";

import { ReactNode } from "react";

export function CampaignStatsFrame({
  title,
  campaignName,
  total,
  page,
  take,
  onPage,
  csvHref,
  children,
}: {
  title: string;
  campaignName: string | null;
  total: number;
  page: number;
  take: number;
  onPage: (page: number) => void;
  csvHref?: string;
  children: ReactNode;
}) {
  const pages = Math.max(1, Math.ceil(total / take));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">{title}</p>
          <h1 className="mt-1 text-2xl font-semibold">{campaignName || "…"}</h1>
          <p className="mt-1 text-sm text-[var(--dim)]">Всего записей: {total}</p>
        </div>
        {csvHref ? (
          <a href={csvHref} className="btn text-sm">
            CSV
          </a>
        ) : null}
      </div>
      <div className="panel overflow-x-auto">{children}</div>
      {pages > 1 ? (
        <div className="flex items-center gap-2 text-sm">
          <button className="btn-ghost px-3 py-1" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Назад
          </button>
          <span className="text-[var(--dim)]">
            {page} / {pages}
          </span>
          <button className="btn-ghost px-3 py-1" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Дальше
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function fmtTime(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}
