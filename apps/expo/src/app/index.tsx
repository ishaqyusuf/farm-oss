import { Link } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-provider";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function HomeScreen() {
  const { isHydrated, session, signIn, signOut } = useAuth();
  const { flocks, summary } = useDashboardData();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#102015" }}>
      <ScrollView
        contentContainerStyle={{
          gap: 20,
          padding: 20,
          paddingBottom: 36
        }}
      >
        <View
          style={{
            backgroundColor: "#17301f",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: 28,
            borderWidth: 1,
            gap: 14,
            padding: 24
          }}
        >
          <Text style={{ color: "#e9b949", fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" }}>
            Mobile
          </Text>
          <Text style={{ color: "#f7f0de", fontSize: 34, fontWeight: "800", letterSpacing: -0.8, lineHeight: 38 }}>
            Farm records in your pocket.
          </Text>
          <Text style={{ color: "rgba(247,240,222,0.82)", fontSize: 16, lineHeight: 25 }}>
            Expo is now wired to the Farm OSS API through tRPC, with a lightweight mobile auth session.
          </Text>
          {!isHydrated ? (
            <ActivityIndicator color="#e9b949" />
          ) : session ? (
            <View style={{ gap: 10 }}>
              <Text style={{ color: "#f7f0de", fontSize: 15 }}>
                Signed in as {session.user.name} ({session.user.role})
              </Text>
              <Pressable
                onPress={() => signOut()}
                style={{
                  alignItems: "center",
                  backgroundColor: "#e9b949",
                  borderRadius: 16,
                  justifyContent: "center",
                  minHeight: 52,
                  paddingHorizontal: 18
                }}
              >
                <Text style={{ color: "#18210f", fontSize: 16, fontWeight: "700" }}>Sign out</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() =>
                signIn({
                  email: "manager@farmoss.app",
                  password: "demo1234"
                })
              }
              style={{
                alignItems: "center",
                backgroundColor: "#e9b949",
                borderRadius: 16,
                justifyContent: "center",
                minHeight: 52,
                paddingHorizontal: 18
              }}
            >
              <Text style={{ color: "#18210f", fontSize: 16, fontWeight: "700" }}>Demo sign in</Text>
            </Pressable>
          )}
          <Link asChild href="/record">
            <Pressable
              style={{
                alignItems: "center",
                borderColor: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 52,
                paddingHorizontal: 18
              }}
            >
              <Text style={{ color: "#f7f0de", fontSize: 16, fontWeight: "700" }}>Open sample daily record</Text>
            </Pressable>
          </Link>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: 24,
            borderWidth: 1,
            gap: 10,
            padding: 20
          }}
        >
          <Text style={{ color: "#f7f0de", fontSize: 20, fontWeight: "700" }}>tRPC daily summary</Text>
          <Text style={{ color: "rgba(247,240,222,0.76)", fontSize: 15, lineHeight: 23 }}>
            {summary.data
              ? `${summary.data.eggCount} eggs, ${summary.data.feedQuantityKg}kg feed, ${summary.data.mortalityCount} mortality`
              : "Loading summary from API..."}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: 24,
            borderWidth: 1,
            gap: 10,
            padding: 20
          }}
        >
          <Text style={{ color: "#f7f0de", fontSize: 20, fontWeight: "700" }}>Starter flock data</Text>
          <Text style={{ color: "rgba(247,240,222,0.76)", fontSize: 15, lineHeight: 23 }}>
            {flocks.data?.[0]
              ? `${flocks.data[0].type} batch with ${flocks.data[0].birdCount} birds at ${flocks.data[0].ageInDays} days`
              : "Loading flocks from API..."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

