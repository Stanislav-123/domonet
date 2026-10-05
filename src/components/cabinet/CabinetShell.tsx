"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/roles";
import { useT } from "@/components/i18n/I18nProvider";

export function CabinetShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const { t } = useT();
  const path = usePathname();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  const links = [
    { href: "/cabinet", label: t("cab.stats") },
    { href: "/cabinet/links", label: t("cab.campaigns") },
  ];
  return (
    <div className="min-h-screen md:grid md:grid-cols-[200px_1fr]">
      <aside className="border-b border-[var(--line)] md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <p className="mono text-sm">{t("brand")}</p>
          <p className="text-xs text-[var(--dim)]">{user.login}</p>
        </div>
        <nav className="flex gap-1 px-2 pb-3 md:flex-col">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`px-3 py-2 text-sm ${path === l.href ? "bg-[var(--bg-2)]" : "text-[var(--dim)]"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="px-4 pb-4 text-xs text-[var(--dim)]">
          {t("nav.logout")}
        </button>
      </aside>
      <div className="p-4 md:p-7">{children}</div>
    </div>
  );
}
