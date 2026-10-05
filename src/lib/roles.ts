import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  login: string;
  name: string;
  role: Role;
};

export function isOwner(role: Role) {
  return role === "owner";
}

export function canAccessAdmin(role: Role) {
  void role;
  return true;
}

export function canManageLanders(role: Role) {
  return role === "owner";
}

export function canManageUsers(role: Role) {
  return role === "owner";
}

export function canSeeLeadPii(role: Role) {
  return role === "owner";
}

export function canSeeAllStats(role: Role) {
  return role === "owner";
}

export function affiliateScope(session: SessionUser) {
  return canSeeAllStats(session.role) ? {} : { affiliateId: session.id };
}
