export type FarmRole = "owner" | "manager" | "staff";

export const FARM_ROLES: FarmRole[] = ["owner", "manager", "staff"];

export type AuthUser = {
  email: string;
  id: string;
  name: string;
  role: FarmRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
