"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";

export default function ThanksPage() {
  const { t } = useT();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-md p-6">
        <p className="kicker">ok</p>
        <h1 className="mt-2 text-3xl font-semibold">{t("thanks.title")}</h1>
        <p className="mt-3 text-[var(--dim)]">{t("thanks.text")}</p>
        <Link href="/" className="mt-5 inline-block text-sm text-[var(--signal)]">{t("thanks.home")}</Link>
      </div>
    </main>
  );
}
