import type { FarmRole } from "@farm-oss/auth";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

type Props = {
  /** Roles that are allowed to view this screen. */
  allowed: FarmRole[];
  children: ReactNode;
  /** Fallback content shown when the user's role is not allowed. */
  fallback?: ReactNode;
};

/**
 * Conditionally renders children based on the current user's role.
 * If the user is not signed in or their role is not in the `allowed` list,
 * a default "access restricted" message is shown (or the optional fallback).
 */
export function RoleGuard({ allowed, children, fallback }: Props) {
  const { session } = useAuth();
  const { theme } = useTheme();

  if (!session || !allowed.includes(session.user.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text variant="title" theme={theme}>
          🔒
        </Text>
        <Text variant="title" theme={theme} className="text-center mt-2">
          Access restricted
        </Text>
        <Text
          variant="detail"
          theme={theme}
          className={`text-center mt-1 ${theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary"}`}
        >
          You don't have permission to view this screen. Contact your farm
          manager for access.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Maps tab screens to the minimum roles required.
 * "staff" can record data and view history.
 * "manager" can also manage expenses and sales.
 * "owner" has full access.
 */
export const SCREEN_ROLES: Record<string, FarmRole[]> = {
  index: ["owner", "manager", "staff"],
  record: ["owner", "manager", "staff"],
  history: ["owner", "manager", "staff"],
  expenses: ["owner", "manager"],
  sales: ["owner", "manager"],
};
