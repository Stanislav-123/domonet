"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CampaignStatsFrame, fmtTime } from "@/components/admin/CampaignStatsFrame";

type LeadRow = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string | null;
  status: string;
  ip: string | null;
  device: string | null;
  createdAt: string;
  lander: { name: string; slug: string };
  click: {
    clickId: string;
    ip: string;
    country: string | null;
    device: string | null;
    os: string | null;
    browser: string | null;
    userAgent: string | null;
    referer: string | null;
    source: string | null;
    isUnique: boolean;
    isBot: boolean;
  } | null;
};

export default function CampaignLeadsPage() {
  const { id } = useParams<{ id: string }>();
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const take = 100;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/campaigns/${id}/leads?page=${page}&take=${take}`)
      .then((r) => r.json())
      .then((d) => {
        setCampaignName(d.campaign?.name || null);
        setLeads(d.leads || []);
        setTotal(d.total || 0);
      });
  }, [id, page]);

  return (
    <CampaignStatsFrame
      title="Лиды кампании"
      campaignName={campaignName}
      total={total}
      page={page}
      take={take}
      onPage={setPage}
      csvHref={id ? `/api/admin/campaigns/${id}/leads/export` : undefined}
    >
      <table className="data">
        <thead>
          <tr>
            <th>Время</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Статус</th>
            <th>Гео</th>
            <th>IP</th>
            <th>Устройство</th>
            <th>OS</th>
            <th>Браузер</th>
            <th>Ленд</th>
            <th>Referer</th>
            <th>User-Agent</th>
            <th>Click ID</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td className="whitespace-nowrap text-[var(--dim)]">{fmtTime(l.createdAt)}</td>
              <td>{l.name}</td>
              <td>{l.lastName || "—"}</td>
              <td>{l.email}</td>
              <td>{l.phone}</td>
              <td>{l.status}</td>
              <td>{l.country || l.click?.country || "—"}</td>
              <td className="mono">{l.ip || l.click?.ip || "—"}</td>
              <td>{l.device || l.click?.device || "—"}</td>
              <td>{l.click?.os || "—"}</td>
              <td>{l.click?.browser || "—"}</td>
              <td>{l.lander.name}</td>
              <td className="max-w-[220px] truncate" title={l.click?.referer || ""}>
                {l.click?.referer || "—"}
              </td>
              <td className="max-w-[280px] truncate" title={l.click?.userAgent || ""}>
                {l.click?.userAgent || "—"}
              </td>
              <td className="mono">{l.click?.clickId || "—"}</td>
            </tr>
          ))}
          {leads.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-[var(--dim)]">
                Лидов пока нет
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </CampaignStatsFrame>
  );
}
