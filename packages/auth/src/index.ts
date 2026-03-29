/**
 * Tenant-level roles:
 *   owner   – full access to all farms and tenant settings
 *   manager – operational access to all farms, no user/billing management
 *   worker  – farm-scoped access via FarmMember assignment only
 */
export type FarmRole = "owner" | "manager" | "worker";

export const FARM_ROLES: FarmRole[] = ["owner", "manager", "worker"];

/** Role assigned to a user within a specific farm (workers only) */
export type FarmMemberRole = "worker";

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
 * Role hierarchy for tenant-level operations.
 * owner > manager > worker
 */
export const ROLE_HIERARCHY: Record<FarmRole, number> = {
  owner: 3,
  manager: 2,
  worker: 1,
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

/** Returns true if the role has tenant-wide farm access (no FarmMember check needed) */
export function hasTenantWideFarmAccess(role: FarmRole): boolean {
  return role === "owner" || role === "manager";
}

/**
 * Supported farm types. Add new types here as the platform expands.
 * Each farm type maps to its own set of domain models.
 */
export type FarmType = "poultry" | "fish";

export const FARM_TYPES: FarmType[] = ["poultry", "fish"];
