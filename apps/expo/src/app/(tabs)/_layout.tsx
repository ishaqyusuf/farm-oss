import { Tabs } from "expo-router";
import { Text as RNText } from "react-native";
import { SCREEN_ROLES } from "@/components/RoleGuard";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useSync } from "@/providers/sync-provider";

function TabIcon({ label }: { label: string }) {
  return <RNText style={{ fontSize: 20 }}>{label}</RNText>;
}

export default function TabLayout() {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { pendingCount } = useSync();
  const role = session?.user.role;

  /** Whether the current user may see a given tab. */
  function canAccess(screen: string) {
    if (!role) return false;
    const allowed = SCREEN_ROLES[screen];
    return allowed ? allowed.includes(role) : true;
  }

  const syncBadge = pendingCount > 0 ? `${pendingCount}` : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#17301f" : "#ffffff",
          borderTopColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "#ded5c3",
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: isDark ? "#e9b949" : "#2f6b3b",
        tabBarInactiveTintColor: isDark
          ? "rgba(247,240,222,0.76)"
          : "#5d6558",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <TabIcon label="🏠" />,
          tabBarBadge: syncBadge,
          href: canAccess("index") ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "Record",
          tabBarIcon: () => <TabIcon label="✏️" />,
          href: canAccess("record") ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: () => <TabIcon label="💰" />,
          href: canAccess("expenses") ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: () => <TabIcon label="🛒" />,
          href: canAccess("sales") ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: () => <TabIcon label="📋" />,
          href: canAccess("history") ? undefined : null,
        }}
      />
    </Tabs>
  );
}
