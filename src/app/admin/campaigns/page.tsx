"use client";

import { FormEvent, useEffect, useState } from "react";

type LanderOpt = { id: string; name: string; slug: string; active: boolean };

type Campaign = {
  id: string;
  name: string;
  active: boolean;
  affiliate: { login: string; name: string } | null;
  trackingLinks: { id: string; code: string; name: string }[];
  landers: LanderOpt[];
  widget?: { exitPopup: boolean; timedPopup: boolean; timedPopupSec: number };
  _count: { trackingLinks: number; clicks: number; leads: number };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function load() {
    fetch("/api/admin/campaigns")
      .then(async (r) => {
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then((d) => setCampaigns(d.campaigns || []))
      .catch(() => setCampaigns([]));
  }
  useEffect(load, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
      }),
    });
    formEl.reset();
    load();
  }

  async function patch(id: string, data: Record<string, unknown>) {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function remove(c: Campaign) {
    if (!confirm(`Удалить кампанию «${c.name}»? Скрипт на внешних сайтах перестанет работать.`)) {
      return;
    }
    await fetch(`/api/admin/campaigns/${c.id}`, { method: "DELETE" });
    load();
  }

  function snippet(code: string) {
    return `<script src="${origin}/t.js" data-code="${code}"></script>`;
  }

  async function copy(code: string) {
    await navigator.clipboard.writeText(snippet(code));
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Кампании</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--dim)]">
          Скрипт вешается на внешний сайт. Назад всегда ведёт на ленд. Попапы и набор лендов — в редакторе.
        </p>
      </div>
      <form onSubmit={create} className="panel grid gap-2 p-4 md:grid-cols-[1fr_auto]">
        <input name="name" required placeholder="Название кампании" className="field" />
        <button className="btn">Создать</button>
      </form>
      <div className="space-y-3">
        {campaigns.map((c) => {
          const code = c.trackingLinks[0]?.code;
          const landerLabel =
            c.landers.length === 0 ? "все активные" : c.landers.map((l) => l.name).join(", ");
          const w = c.widget;
          const popupLabel = w
            ? [
                w.exitPopup ? "exit вкл" : "exit выкл",
                w.timedPopup ? `таймер ${w.timedPopupSec}с` : "таймер выкл",
              ].join(" · ")
            : "";
          return (
            <div key={c.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {c.name}
                    {!c.active ? <span className="ml-2 text-xs text-[var(--bad)]">выкл</span> : null}
                  </p>
                  <p className="mt-1 text-xs text-[var(--dim)]">
                    {c.affiliate?.login || "—"} · кликов {c._count.clicks} · лидов {c._count.leads} · ленды{" "}
                    {landerLabel}
                    {popupLabel ? ` · ${popupLabel}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/admin/campaigns/${c.id}`} className="btn px-3 py-2 text-sm">
                    Редактировать
                  </a>
                  <a
                    href={`/admin/campaigns/${c.id}/clicks`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost inline-flex items-center px-3 py-2 text-sm"
                  >
                    Статистика кликов
                  </a>
                  <a
                    href={`/admin/campaigns/${c.id}/leads`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost inline-flex items-center px-3 py-2 text-sm"
                  >
                    Статистика лидов
                  </a>
                  <button onClick={() => patch(c.id, { active: !c.active })} className="btn-ghost px-3 py-2 text-sm">
                    {c.active ? "Выключить" : "Включить"}
                  </button>
                  <button onClick={() => remove(c)} className="btn-ghost px-3 py-2 text-sm text-[var(--bad)]">
                    Удалить
                  </button>
                </div>
              </div>
              {code ? (
                <div className="mt-4">
                  <p className="kicker">Скрипт для внешнего сайта</p>
                  <pre className="mt-1 overflow-x-auto bg-black px-3 py-2 font-mono text-xs">{snippet(code)}</pre>
                  <button onClick={() => copy(code)} className="btn mt-2 text-sm">
                    {copied === code ? "Скопировано" : "Скопировать ссылку"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
