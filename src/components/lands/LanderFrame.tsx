"use client";

import type { ReactNode } from "react";
import { useT } from "@/components/i18n/I18nProvider";

export function LanderFrame({
  children,
  wide,
  ticker,
}: {
  children: ReactNode;
  wide?: boolean;
  ticker?: ReactNode;
}) {
  const { locale } = useT();
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
        <span className="mono text-sm">
          AQ/<span className="text-[var(--signal)]">SYS</span>
        </span>
        <span className="mono text-[11px] text-[var(--dim)]">{locale.toUpperCase()}</span>
      </header>
      {ticker}
      <div className={`mx-auto px-4 py-8 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>{children}</div>
    </div>
  );
}
