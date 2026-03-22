import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/auth-provider";
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TRPCReactProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              animation: "fade",
              contentStyle: {
                backgroundColor: "#102015",
              },
              headerShown: false,
            }}
          />
        </AuthProvider>
      </TRPCReactProvider>
    </SafeAreaProvider>
  );
}
