"use client";

import { BackExitTracker } from "@/components/tracker/BackExitTracker";
import { GeoPing } from "@/components/tracker/GeoPing";
import { useT } from "@/components/i18n/I18nProvider";

export function PrelandView({ clickId, landerUrl }: { clickId: string; landerUrl: string }) {
  const { t } = useT();
  return (
    <main className="min-h-screen">
      <GeoPing clickId={clickId} />
      <BackExitTracker clickId={clickId} landerUrl={landerUrl} />
      <article className="mx-auto max-w-2xl px-4 py-16">
        <p className="kicker">{t("pre.kicker")}</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight">{t("pre.title")}</h1>
        <div className="mt-6 space-y-4 text-[var(--dim)]">
          <p>{t("pre.p1")}</p>
          <p>{t("pre.p2")}</p>
        </div>
        <a href={landerUrl} className="btn mt-10 inline-flex">
          {t("pre.cta")}
        </a>
      </article>
    </main>
  );
}
