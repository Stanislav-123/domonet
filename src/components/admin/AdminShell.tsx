"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/roles";
import { useT } from "@/components/i18n/I18nProvider";

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const { t } = useT();
  const path = usePathname();
  const links =
    user.role === "owner"
      ? [
          { href: "/admin", label: t("admin.dash") },
          { href: "/admin/landers", label: t("admin.landers") },
          { href: "/admin/leads", label: t("admin.leads") },
          { href: "/admin/campaigns", label: t("admin.campaigns") },
          { href: "/admin/integrations", label: "Интеграции" },
          { href: "/admin/users", label: t("admin.users") },
        ]
      : [
          { href: "/admin", label: t("admin.dash") },
          { href: "/admin/campaigns", label: t("admin.campaigns") },
          { href: "/admin/leads", label: t("admin.leads") },
          { href: "/admin/landers", label: t("admin.landers") },
        ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[210px_1fr]">
      <aside className="border-b border-[var(--line)] md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <p className="mono text-sm">{t("brand")}</p>
          <p className="text-xs text-[var(--dim)]">
            {user.name} · {user.role}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 text-sm ${
                l.href === "/admin"
                  ? path === "/admin"
                    ? "bg-[var(--bg-2)]"
                    : "text-[var(--dim)]"
                  : path === l.href || path.startsWith(`${l.href}/`)
                    ? "bg-[var(--bg-2)]"
                    : "text-[var(--dim)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="px-4 pb-4 text-xs text-[var(--dim)]">
          {t("nav.logout")}
        </button>
      </aside>
      <div className="min-w-0 p-4 md:p-7">{children}</div>
    </div>
  );
}
