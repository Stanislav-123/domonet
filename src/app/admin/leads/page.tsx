"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string | null;
  status: string;
  payout: number | null;
  partnerResponse: string | null;
  partnerStatus: string | null;
  createdAt: string;
  lander: { name: string };
  affiliate: { login: string; name: string } | null;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [responseModal, setResponseModal] = useState<string | null>(null);

  function load() {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    fetch(`/api/admin/leads?${p}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setLeadStatus(id: string, next: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  const exportUrl = `/api/admin/leads/export${status ? `?status=${status}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Лиды</h1>
        <a href={exportUrl} className="btn text-sm">CSV</a>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="имя / email / телефон"
          className="field max-w-xs"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field w-auto">
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="lead">lead</option>
          <option value="sale">sale</option>
          <option value="confirmed">confirmed</option>
          <option value="rejected">rejected</option>
          <option value="duplicate">duplicate</option>
        </select>
        <button onClick={load} className="btn-ghost px-3">Find</button>
      </div>
      <div className="panel overflow-x-auto">
        <table className="data">
          <thead className="bg-white/5 text-muted">
            <tr>
              <th className="px-3 py-2">Время</th>
              <th className="px-3 py-2">Лид</th>
              <th className="px-3 py-2">Контакт</th>
              <th className="px-3 py-2">Страна</th>
              <th className="px-3 py-2">Ленд</th>
              <th className="px-3 py-2">Вебмастер</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Payout</th>
              <th className="px-3 py-2">Resp</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-white/5 align-top">
                <td className="px-3 py-2 whitespace-nowrap text-muted">
                  {new Date(l.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2">{l.name} {l.lastName}</td>
                <td className="px-3 py-2">
                  {l.email}<br />{l.phone}
                </td>
                <td className="px-3 py-2">{l.country || "—"}</td>
                <td className="px-3 py-2">{l.lander.name}</td>
                <td className="px-3 py-2">{l.affiliate?.login || "—"}</td>
                <td className="px-3 py-2">
                  <select
                    value={l.status}
                    onChange={(e) => setLeadStatus(l.id, e.target.value)}
                    className="field w-auto py-1"
                  >
                    <option value="new">new</option>
                    <option value="lead">lead</option>
                    <option value="sale">sale</option>
                    <option value="confirmed">confirmed</option>
                    <option value="rejected">rejected</option>
                    <option value="duplicate">duplicate</option>
                  </select>
                </td>
                <td className="px-3 py-2">{l.payout ? `$${l.payout}` : "—"}</td>
                <td className="px-3 py-2">
                  {l.partnerResponse ? (
                    <button onClick={() => setResponseModal(l.partnerResponse)} className="btn-ghost px-2 py-1 text-xs">
                      Resp
                    </button>
                  ) : (
                    <span className="text-[var(--dim)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {responseModal !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setResponseModal(null)}>
          <div className="mx-4 max-h-[80vh] max-w-2xl overflow-auto rounded-xl bg-[var(--bg)] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Partner Response</p>
              <button onClick={() => setResponseModal(null)} className="btn-ghost px-2 py-1 text-sm">✕</button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-sm text-[var(--dim)]">{responseModal}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
