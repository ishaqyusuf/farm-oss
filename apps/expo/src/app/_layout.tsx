import "../../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth, AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";
import { SyncProvider } from "@/providers/sync-provider";
import { TRPCReactProvider } from "@/trpc/client";

/** Redirects unauthenticated users to login and authenticated users away from it. */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isHydrated, session } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const onLoginScreen = segments[0] === "login";

    if (!session && !onLoginScreen) {
      router.replace("/login");
    } else if (session && onLoginScreen) {
      router.replace("/");
    }
  }, [isHydrated, session, segments, router]);

  return <>{children}</>;
}

function InnerLayout() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          animation: "fade",
          contentStyle: {
            backgroundColor: isDark ? "#102015" : "#f6f1e6",
          },
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TRPCReactProvider>
          <AuthProvider>
            <SyncProvider>
              <AuthGate>
                <InnerLayout />
              </AuthGate>
            </SyncProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
