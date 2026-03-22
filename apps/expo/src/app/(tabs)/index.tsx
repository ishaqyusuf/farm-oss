import { ActivityIndicator, View } from "react-native";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/providers/auth-provider";
import { dark, spacing } from "@/theme";

const t = dark;

export default function HomeScreen() {
  const { isHydrated, session, signIn, signOut } = useAuth();
  const { health, summary, batches } = useDashboardData();

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

      {/* ── Today's summary ──────────────────────────────────────────── */}
      <Card variant="subtle" theme={t}>
        <Text variant="title" theme={t}>
          Today's summary
        </Text>
        {summary.isLoading && (
          <Text variant="detail" color="textTertiary" theme={t}>
            Loading metrics…
          </Text>
        )}
        {summary.isError && (
          <Text variant="detail" color="textTertiary" theme={t}>
            Could not load summary. The API may be offline or no farm data
            exists yet.
          </Text>
        )}
        {summary.data && (
          <View style={{ gap: spacing[2] }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <MetricCell label="🥚 Eggs" value={summary.data.eggCount} />
              <MetricCell
                label="🌾 Feed"
                value={`${(summary.data.feedGrams / 1000).toFixed(1)} kg`}
              />
              <MetricCell label="⚠️ Mortality" value={summary.data.mortality} />
            </View>
            <Text variant="caption" color="textTertiary" theme={t}>
              {summary.data.recordCount} record
              {summary.data.recordCount === 1 ? "" : "s"} for{" "}
              {summary.data.date}
            </Text>
          </View>
        )}
      </Card>

      {/* ── Active batches ───────────────────────────────────────────── */}
      <Card variant="subtle" theme={t}>
        <Text variant="title" theme={t}>
          Active batches
        </Text>
        {batches.isLoading && (
          <Text variant="detail" color="textTertiary" theme={t}>
            Loading batches…
          </Text>
        )}
        {batches.isError && (
          <Text variant="detail" color="textTertiary" theme={t}>
            Could not load batches.
          </Text>
        )}
        {batches.data?.length === 0 && (
          <Text variant="detail" color="textTertiary" theme={t}>
            No active batches.
          </Text>
        )}
        {batches.data?.map((batch) => (
          <View
            key={batch.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="detail" theme={t}>
              {batch.name}
            </Text>
            <Text variant="caption" color="accent" theme={t}>
              {batch.currentCount} birds
            </Text>
          </View>
        ))}
      </Card>

      {/* ── API status ───────────────────────────────────────────────── */}
      <Card variant="subtle" theme={t}>
        <Text variant="title" theme={t}>
          API status
        </Text>
        <Text variant="detail" color="textTertiary" theme={t}>
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
    <View style={{ alignItems: "center", gap: spacing[1] }}>
      <Text variant="caption" color="textTertiary" theme={dark}>
        {label}
      </Text>
      <Text variant="title" theme={dark}>
        {value}
      </Text>
    </View>
  );
}
