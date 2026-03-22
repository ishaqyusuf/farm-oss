import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/auth-provider";
import { dark } from "@/theme";
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
                backgroundColor: dark.background,
              },
              headerShown: false,
            }}
          />
        </AuthProvider>
      </TRPCReactProvider>
    </SafeAreaProvider>
  );
}
