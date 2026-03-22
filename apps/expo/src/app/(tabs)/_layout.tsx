import { Tabs } from "expo-router";
import { Text as RNText } from "react-native";
import { dark } from "@/theme";

function TabIcon({ label }: { label: string }) {
  return <RNText style={{ fontSize: 20 }}>{label}</RNText>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: dark.surface,
          borderTopColor: dark.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: dark.accent,
        tabBarInactiveTintColor: dark.textTertiary,
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
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "Record",
          tabBarIcon: () => <TabIcon label="✏️" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: () => <TabIcon label="📋" />,
        }}
      />
    </Tabs>
  );
}
