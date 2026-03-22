import { Tabs } from "expo-router";
import { Text as RNText } from "react-native";

function TabIcon({ label }: { label: string }) {
  return <RNText style={{ fontSize: 20 }}>{label}</RNText>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#17301f",
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: "#e9b949",
        tabBarInactiveTintColor: "rgba(247,240,222,0.76)",
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
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: () => <TabIcon label="💰" />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: () => <TabIcon label="🛒" />,
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
