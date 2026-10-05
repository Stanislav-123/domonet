"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type LanderOpt = { id: string; name: string; slug: string; active: boolean };
type IntegrationOpt = { id: string; name: string; active: boolean };
type CampaignIntegration = { integrationId: string; weight: number };

type Widget = {
  exitPopup: boolean;
  timedPopup: boolean;
  timedPopupSec: number;
};

export default function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [allLanders, setAllLanders] = useState<LanderOpt[]>([]);
  const [included, setIncluded] = useState<Set<string>>(new Set());
  const [allIntegrations, setAllIntegrations] = useState<IntegrationOpt[]>([]);
  const [campaignIntegrations, setCampaignIntegrations] = useState<CampaignIntegration[]>([]);
  const [widget, setWidget] = useState<Widget>({ exitPopup: true, timedPopup: false, timedPopupSec: 15 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/campaigns/${id}`).then((r) => r.json()),
      fetch("/api/admin/landers").then((r) => r.json()),
      fetch("/api/admin/integrations/options").then((r) => r.json()),
    ])
      .then(([campaignRes, landerRes, intRes]) => {
        const campaign = campaignRes.campaign;
        const landers: LanderOpt[] = landerRes.landers || [];
        setAllLanders(landers);
        setAllIntegrations(intRes.integrations || []);
        if (!campaign) { setError(campaignRes.error || "Кампания не найдена"); return; }
        setName(campaign.name || "");
        const saved: string[] = campaign.landerIds || [];
        setIncluded(new Set(saved.length > 0 ? saved : landers.map((l) => l.id)));
        if (campaign.widget) setWidget(campaign.widget);
        const available = new Set((intRes.integrations || []).map((i: IntegrationOpt) => i.id));
        setCampaignIntegrations(
          (campaign.integrations || []).filter((ci: CampaignIntegration) => available.has(ci.integrationId)),
        );
        setLoaded(true);
      })
      .catch(() => setError("Не удалось загрузить кампанию"));
  }, [id]);

  function toggleLander(landerId: string) {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(landerId)) next.delete(landerId);
      else next.add(landerId);
      return next;
    });
  }

  function toggleIntegration(integrationId: string) {
    setCampaignIntegrations((prev) => {
      if (prev.some((ci) => ci.integrationId === integrationId)) {
        return prev.filter((ci) => ci.integrationId !== integrationId);
      }
      return [...prev, { integrationId, weight: 100 }];
    });
  }

  function setIntWeight(integrationId: string, weight: number) {
    setCampaignIntegrations((prev) =>
      prev.map((ci) => ci.integrationId === integrationId ? { ...ci, weight } : ci),
    );
  }

  const selectedIntSet = useMemo(() => new Set(campaignIntegrations.map((ci) => ci.integrationId)), [campaignIntegrations]);

  async function save() {
    setError(null);
    if (included.size === 0) { setError("Оставьте хотя бы один ленд"); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        landerIds: [...included],
        exitPopup: widget.exitPopup,
        timedPopup: widget.timedPopup,
        timedPopupSec: widget.timedPopupSec,
        integrations: campaignIntegrations,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Не удалось сохранить"); return; }
    router.push("/admin/campaigns");
  }

  if (!loaded && !error) return <p className="text-sm text-[var(--dim)]">Загрузка…</p>;

  const half = Math.ceil(allLanders.length / 2);
  const col1 = allLanders.slice(0, half);
  const col2 = allLanders.slice(half);

  function LanderToggle({ l }: { l: LanderOpt }) {
    const on = included.has(l.id);
    return (
      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5">
        <input type="checkbox" checked={on} onChange={() => toggleLander(l.id)} className="accent-[var(--signal)]" />
        <span className={on ? "" : "text-[var(--dim)]"}>
          {l.name}
          {!l.active ? <span className="ml-1 text-xs text-[var(--bad)]">выкл</span> : null}
        </span>
      </label>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/campaigns" className="text-sm text-[var(--dim)]">← к кампаниям</Link>
        <h1 className="mt-2 text-2xl font-semibold">Редактор кампании</h1>
      </div>

      <div className="panel space-y-3 p-4">
        <p className="kicker">Название</p>
        <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
      </div>

      <div className="panel space-y-3 p-4">
        <p className="kicker">Ленды в ротации</p>
        <div className="grid gap-1 md:grid-cols-2">
          <div className="space-y-0.5">{col1.map((l) => <LanderToggle key={l.id} l={l} />)}</div>
          <div className="space-y-0.5">{col2.map((l) => <LanderToggle key={l.id} l={l} />)}</div>
        </div>
      </div>

      <div className="panel space-y-4 p-4">
        <p className="kicker">Попапы на внешнем сайте</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">Увод курсора за край окна</span>
          <button
            type="button"
            className={widget.exitPopup ? "btn px-3 py-2 text-sm" : "btn-ghost px-3 py-2 text-sm"}
            onClick={() => setWidget((w) => ({ ...w, exitPopup: !w.exitPopup }))}
          >
            {widget.exitPopup ? "Включён" : "Выключен"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">Попап по таймеру</span>
          <button
            type="button"
            className={widget.timedPopup ? "btn px-3 py-2 text-sm" : "btn-ghost px-3 py-2 text-sm"}
            onClick={() => setWidget((w) => ({ ...w, timedPopup: !w.timedPopup }))}
          >
            {widget.timedPopup ? "Включён" : "Выключен"}
          </button>
        </div>
        {widget.timedPopup ? (
          <label className="block max-w-xs text-sm">
            Через сколько секунд показать
            <input
              type="number" min={1} max={3600} value={widget.timedPopupSec}
              onChange={(e) => setWidget((w) => ({ ...w, timedPopupSec: Math.max(1, Number(e.target.value) || 1) }))}
              className="field mt-1"
            />
          </label>
        ) : null}
      </div>

      <div className="panel space-y-3 p-4">
        <p className="kicker">Интеграции (куда уходят лиды)</p>
        <p className="text-sm text-[var(--dim)]">
          Если ничего не выбрано — лиды остаются в системе. При нескольких интеграциях распределение по весу.
        </p>
        {allIntegrations.length === 0 ? (
          <p className="text-sm text-[var(--dim)]">Нет доступных интеграций.</p>
        ) : (
          <div className="space-y-2">
            {allIntegrations.map((i) => {
              const selected = selectedIntSet.has(i.id);
              const ci = campaignIntegrations.find((c) => c.integrationId === i.id);
              return (
                <div key={i.id} className="flex flex-wrap items-center gap-3 rounded border border-[var(--line)] px-3 py-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={selected} onChange={() => toggleIntegration(i.id)} className="accent-[var(--signal)]" />
                    <span className={selected ? "" : "text-[var(--dim)]"}>{i.name}</span>
                  </label>
                  {selected ? (
                    <input
                      type="number" min={1} max={10000} value={ci?.weight || 100}
                      onChange={(e) => setIntWeight(i.id, Math.max(1, Number(e.target.value) || 1))}
                      className="field w-20 text-sm" placeholder="Вес"
                    />
                  ) : null}
                  <span className="text-xs text-[var(--dim)]">{i.active ? "активна" : "выключена"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
      <div className="flex gap-2">
        <button disabled={saving} onClick={save} className="btn">{saving ? "Сохранение…" : "Сохранить"}</button>
        <Link href="/admin/campaigns" className="btn-ghost px-4 py-2">Отмена</Link>
      </div>
    </div>
  );
}
