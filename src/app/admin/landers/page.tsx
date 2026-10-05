"use client";

import { FormEvent, useEffect, useState } from "react";
import { LANDER_TYPE_OPTIONS } from "@/lib/lander-types";

type Lander = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

export default function LandersPage() {
  const [landers, setLanders] = useState<Lander[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  function load() {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsOwner(d?.role === "owner"))
      .catch(() => setIsOwner(false));
    fetch("/api/admin/landers")
      .then(async (r) => {
        const text = await r.text();
        const d = text ? JSON.parse(text) : {};
        if (!r.ok) throw new Error(d.error || "landers");
        setLanders(d.landers || []);
      })
      .catch(() => setError("Не удалось загрузить ленды"));
  }
  useEffect(load, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch("/api/admin/landers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: form.get("slug"),
        type: form.get("type"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Не удалось создать");
      return;
    }
    formEl.reset();
    load();
  }

  const labels = Object.fromEntries(LANDER_TYPE_OPTIONS.map((o) => [o.type, o.label]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Домонетные ленды</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--dim)]">
          Каталог офферов. Какие ленды крутятся — выбирается в кампании, не весом и не капом.
        </p>
      </div>
      {isOwner ? (
        <form onSubmit={create} className="panel grid gap-2 p-4 md:grid-cols-4">
          <input name="name" required placeholder="Название" className="field" />
          <input name="slug" required placeholder="slug" className="field" />
          <select name="type" className="field">
            {LANDER_TYPE_OPTIONS.map((o) => (
              <option key={o.type} value={o.type}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="btn">Добавить</button>
          {error ? <p className="md:col-span-4 text-sm text-[var(--bad)]">{error}</p> : null}
        </form>
      ) : (
        <div className="panel p-4 text-sm text-[var(--dim)]">У вас доступ только на просмотр лендов.</div>
      )}
      <div className="panel overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            {landers.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td className="text-accent">
                  <a href={`/l/${l.slug}`} target="_blank" rel="noreferrer">
                    /l/{l.slug}
                  </a>
                </td>
                <td>{labels[l.type] || l.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
