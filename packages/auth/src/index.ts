export type FarmRole = "owner" | "manager" | "staff";

export const FARM_ROLES: FarmRole[] = ["owner", "manager", "staff"];

export type AuthUser = {
  id: string;
  userId: string; // unique 6-digit login identifier
  email: string;
  name: string;
  role: FarmRole;
  tenantId: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

/**
 * Role hierarchy: owner > manager > staff
 * - owner: full access (read, write, delete, manage users)
 * - manager: read + write, no delete
 * - staff: read + create daily records only
 */
export const ROLE_HIERARCHY: Record<FarmRole, number> = {
  owner: 3,
  manager: 2,
  staff: 1,
};

export function hasRole(userRole: FarmRole, required: FarmRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export function isOwner(role: FarmRole): boolean {
  return role === "owner";
}

export function isManagerOrAbove(role: FarmRole): boolean {
  return hasRole(role, "manager");
}
