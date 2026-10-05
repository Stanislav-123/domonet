"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CampaignStatsFrame, fmtTime } from "@/components/admin/CampaignStatsFrame";

type ClickRow = {
  id: string;
  clickId: string;
  ip: string;
  country: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  userAgent: string | null;
  referer: string | null;
  source: string | null;
  isBot: boolean;
  isUnique: boolean;
  createdAt: string;
  lander: { name: string; slug: string } | null;
};

export default function CampaignClicksPage() {
  const { id } = useParams<{ id: string }>();
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const take = 100;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/campaigns/${id}/clicks?page=${page}&take=${take}`)
      .then((r) => r.json())
      .then((d) => {
        setCampaignName(d.campaign?.name || null);
        setClicks(d.clicks || []);
        setTotal(d.total || 0);
      });
  }, [id, page]);

  return (
    <CampaignStatsFrame
      title="Клики кампании"
      campaignName={campaignName}
      total={total}
      page={page}
      take={take}
      onPage={setPage}
      csvHref={id ? `/api/admin/campaigns/${id}/clicks/export` : undefined}
    >
      <table className="data">
        <thead>
          <tr>
            <th>Время</th>
            <th>IP</th>
            <th>Гео</th>
            <th>Уник</th>
            <th>Бот</th>
            <th>Устройство</th>
            <th>OS</th>
            <th>Браузер</th>
            <th>Ленд</th>
            <th>Referer</th>
            <th>Source</th>
            <th>User-Agent</th>
            <th>Click ID</th>
          </tr>
        </thead>
        <tbody>
          {clicks.map((c) => (
            <tr key={c.id}>
              <td className="whitespace-nowrap text-[var(--dim)]">{fmtTime(c.createdAt)}</td>
              <td className="mono">{c.ip}</td>
              <td>{c.country || "—"}</td>
              <td>{c.isUnique ? "да" : "нет"}</td>
              <td>{c.isBot ? "да" : "нет"}</td>
              <td>{c.device || "—"}</td>
              <td>{c.os || "—"}</td>
              <td>{c.browser || "—"}</td>
              <td>{c.lander?.name || "—"}</td>
              <td className="max-w-[220px] truncate" title={c.referer || ""}>
                {c.referer || "—"}
              </td>
              <td>{c.source || "—"}</td>
              <td className="max-w-[280px] truncate" title={c.userAgent || ""}>
                {c.userAgent || "—"}
              </td>
              <td className="mono">{c.clickId}</td>
            </tr>
          ))}
          {clicks.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-[var(--dim)]">
                Кликов пока нет
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </CampaignStatsFrame>
  );
}
