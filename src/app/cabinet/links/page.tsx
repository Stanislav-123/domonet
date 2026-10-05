"use client";

import { FormEvent, useEffect, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";

type LinkRow = {
  id: string;
  code: string;
  name: string;
  lander: { name: string; slug: string } | null;
};

export default function CampaignsPage() {
  const { t } = useT();
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [landers, setLanders] = useState<{ id: string; name: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function load() {
    fetch("/api/cabinet/links")
      .then((r) => r.json())
      .then((d) => setLinks(d.links || []));
    fetch("/api/cabinet/meta")
      .then((r) => r.json())
      .then((d) => setLanders(d.landers || []));
  }
  useEffect(load, []);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const landerId = String(form.get("landerId") || "");
    const lander = landers.find((l) => l.id === landerId);
    await fetch("/api/cabinet/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || lander?.name || "campaign"),
        landerId,
      }),
    });
    formEl.reset();
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
        <h1 className="text-2xl font-semibold">{t("camp.title")}</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--dim)]">{t("camp.lead")}</p>
      </div>
      <form onSubmit={create} className="panel grid gap-2 p-4 md:grid-cols-[1fr_1fr_auto]">
        <input name="name" placeholder={t("camp.name")} className="field" />
        <select name="landerId" required className="field">
          <option value="">{t("camp.lander")}</option>
          {landers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button className="btn">{t("camp.create")}</button>
      </form>
      <div className="space-y-3">
        {links.map((l) => (
          <div key={l.id} className="panel p-4">
            <p className="font-medium">
              {l.name}
              <span className="ml-2 text-sm text-[var(--dim)]">{l.lander?.name || "—"}</span>
            </p>
            <p className="mt-3 text-xs text-[var(--dim)]">{t("camp.snippet")}</p>
            <pre className="mt-1 overflow-x-auto bg-black px-3 py-2 font-mono text-xs">{snippet(l.code)}</pre>
            <button onClick={() => copy(l.code)} className="btn mt-2 text-sm">
              {copied === l.code ? t("camp.copied") : t("camp.copy")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
