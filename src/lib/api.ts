import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { canAccessAdmin, canManageLanders, canManageUsers, canSeeLeadPii } from "@/lib/roles";
import type { SessionUser } from "@/lib/roles";

export { affiliateScope, canSeeAllStats } from "@/lib/roles";

export async function requireApiUser() {
  const session = await getSession();
  if (!session) return { error: jsonError("Нужна авторизация", 401), session: null as SessionUser | null };
  return { error: null, session };
}

export async function requireAdmin() {
  const { error, session } = await requireApiUser();
  if (error || !session) return { error: error ?? jsonError("Нужна авторизация", 401), session: null };
  if (!canAccessAdmin(session.role)) return { error: jsonError("Нет доступа", 403), session: null };
  return { error: null, session };
}

export async function requireOwner() {
  const { error, session } = await requireAdmin();
  if (error || !session) return { error, session: null };
  if (!canManageLanders(session.role) || !canManageUsers(session.role)) {
    return { error: jsonError("Только владелец", 403), session: null };
  }
  return { error: null, session };
}

export { canSeeLeadPii };
