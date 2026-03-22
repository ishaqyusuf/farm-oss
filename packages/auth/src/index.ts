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
