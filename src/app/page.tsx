"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useT();
  return (
    <main>
      <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <span className="mono text-sm">{t("brand")}</span>
        <Link href="/login" className="btn text-sm">{t("nav.login")}</Link>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-24">
        <p className="kicker">{t("home.kicker")}</p>
        <h1 className="mt-3 max-w-xl text-5xl font-semibold leading-[1.1]">{t("home.title")}</h1>
        <p className="mt-4 max-w-lg text-[var(--dim)]">{t("home.lead")}</p>
        <div className="mt-8">
          <Link href="/login" className="btn">{t("nav.login")}</Link>
        </div>
      </section>
    </main>
  );
}
