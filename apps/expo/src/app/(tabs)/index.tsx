import { ActivityIndicator, View } from "react-native";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/providers/auth-provider";

const theme = "dark" as const;

export default function HomeScreen() {
  const { isHydrated, session, signIn, signOut } = useAuth();
  const { health, summary, batches } = useDashboardData();

  return (
    <Screen theme={theme}>
      <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
        <Text variant="tag" theme={theme} className="text-dark-accent">
          Dashboard
        </Text>
        <Text variant="hero" theme={theme}>
          Farm records{"\n"}in your pocket.
        </Text>
        {!isHydrated ? (
          <ActivityIndicator color="#e9b949" />
        ) : session ? (
          <View className="gap-2.5">
            <Text variant="detail" theme={theme}>
              Signed in as {session.user.name} ({session.user.role})
            </Text>
            <Button theme={theme} onPress={() => signOut()}>
              Sign out
            </Button>
          </View>
        ) : (
          <Button
            theme={theme}
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

      {/* ── Today's summary ──────────────────────────────────────────── */}
      <Card variant="subtle" theme={theme}>
        <Text variant="title" theme={theme}>
          Today's summary
        </Text>
        {summary.isLoading && (
          <Text
            variant="detail"
            theme={theme}
            className="text-dark-text-tertiary"
          >
            Loading metrics…
          </Text>
        )}
        {summary.isError && (
          <Text
            variant="detail"
            theme={theme}
            className="text-dark-text-tertiary"
          >
            Could not load summary. The API may be offline or no farm data
            exists yet.
          </Text>
        )}
        {summary.data && (
          <View className="gap-2">
            <View className="flex-row justify-between">
              <MetricCell label="🥚 Eggs" value={summary.data.eggCount} />
              <MetricCell
                label="🌾 Feed"
                value={`${(summary.data.feedGrams / 1000).toFixed(1)} kg`}
              />
              <MetricCell label="⚠️ Mortality" value={summary.data.mortality} />
            </View>
            <Text
              variant="caption"
              theme={theme}
              className="text-dark-text-tertiary"
            >
              {summary.data.recordCount} record
              {summary.data.recordCount === 1 ? "" : "s"} for{" "}
              {summary.data.date}
            </Text>
          </View>
        )}
      </Card>

      {/* ── Active batches ───────────────────────────────────────────── */}
      <Card variant="subtle" theme={theme}>
        <Text variant="title" theme={theme}>
          Active batches
        </Text>
        {batches.isLoading && (
          <Text
            variant="detail"
            theme={theme}
            className="text-dark-text-tertiary"
          >
            Loading batches…
          </Text>
        )}
        {batches.isError && (
          <Text
            variant="detail"
            theme={theme}
            className="text-dark-text-tertiary"
          >
            Could not load batches.
          </Text>
        )}
        {batches.data?.length === 0 && (
          <Text
            variant="detail"
            theme={theme}
            className="text-dark-text-tertiary"
          >
            No active batches.
          </Text>
        )}
        {batches.data?.map((batch) => (
          <View
            key={batch.id}
            className="flex-row justify-between items-center"
          >
            <Text variant="detail" theme={theme}>
              {batch.name}
            </Text>
            <Text variant="caption" theme={theme} className="text-dark-accent">
              {batch.currentCount} birds
            </Text>
          </View>
        ))}
      </Card>

      {/* ── API status ───────────────────────────────────────────────── */}
      <Card variant="subtle" theme={theme}>
        <Text variant="title" theme={theme}>
          API status
        </Text>
        <Text
          variant="detail"
          theme={theme}
          className="text-dark-text-tertiary"
        >
          {health.data
            ? `API is ${health.data.status} — ${health.data.timestamp}`
            : "Connecting to API..."}
        </Text>
      </Card>
    </Screen>
  );
}

/** Small metric display for the summary row. */
function MetricCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View className="items-center gap-1">
      <Text variant="caption" theme="dark" className="text-dark-text-tertiary">
        {label}
      </Text>
      <Text variant="title" theme="dark">
        {value}
      </Text>
    </View>
  );
}
