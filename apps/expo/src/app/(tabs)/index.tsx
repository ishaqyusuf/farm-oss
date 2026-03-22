import { ActivityIndicator, View } from "react-native";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/providers/auth-provider";
import { dark, spacing } from "@/theme";

const t = dark;

export default function HomeScreen() {
  const { isHydrated, session, signIn, signOut } = useAuth();
  const { summary } = useDashboardData();

  return (
    <Screen theme={t}>
      <Card
        theme={t}
        style={{ gap: spacing[3.5], padding: spacing[6], borderRadius: 28 }}
      >
        <Text variant="tag" color="accent" theme={t}>
          Dashboard
        </Text>
        <Text variant="hero" theme={t}>
          Farm records{"\n"}in your pocket.
        </Text>
        {!isHydrated ? (
          <ActivityIndicator color={t.accent} />
        ) : session ? (
          <View style={{ gap: spacing[2.5] }}>
            <Text variant="detail" theme={t}>
              Signed in as {session.user.name} ({session.user.role})
            </Text>
            <Button theme={t} onPress={() => signOut()}>
              Sign out
            </Button>
          </View>
        ) : (
          <Button
            theme={t}
            onPress={() =>
              signIn({
                email: "manager@farmoss.app",
                password: "demo1234",
              })
            }
          >
            Demo sign in
          </Button>
        )}
      </Card>

      <Card variant="subtle" theme={t}>
        <Text variant="title" theme={t}>
          API status
        </Text>
        <Text variant="detail" color="textTertiary" theme={t}>
          {summary.data
            ? `API is ${summary.data.status} — ${summary.data.timestamp}`
            : "Connecting to API..."}
        </Text>
      </Card>

      <Card variant="subtle" theme={t}>
        <Text variant="title" theme={t}>
          Getting started
        </Text>
        <Text variant="detail" color="textTertiary" theme={t}>
          Use the Record tab to log daily flock activity. View past entries in
          the History tab.
        </Text>
      </Card>
    </Screen>
  );
}
