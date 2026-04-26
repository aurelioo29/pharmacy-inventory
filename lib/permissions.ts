import type { Session } from "next-auth";

export function hasPermission(
  session: Session | null,
  permission: string,
): boolean {
  return session?.user?.permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(
  session: Session | null,
  permissions: string[],
): boolean {
  return permissions.some((permission) => hasPermission(session, permission));
}

export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.roles?.includes(role) ?? false;
}
