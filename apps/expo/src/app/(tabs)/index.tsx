import { ActivityIndicator, View } from "react-native";
import { Button, Card, Screen, Text } from "@/components/ui";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useSync } from "@/providers/sync-provider";

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { theme } = useTheme();
  const { health, summary, batches } = useDashboardData();
  const { status, pendingCount, isOnline } = useSync();

  const accentClass =
    theme === "dark" ? "text-dark-accent" : "text-light-accent";
  const subtextClass =
    theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary";
  const secondaryClass =
    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.index}>
      <Screen theme={theme}>
        {/* ── Welcome card ─────────────────────────────────────────────── */}
        <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" theme={theme} className={accentClass}>
            Dashboard
          </Text>
          <Text variant="hero" theme={theme}>
            Farm records{"\n"}in your pocket.
          </Text>
          {session && (
            <View className="gap-2.5">
              <Text variant="detail" theme={theme} className={secondaryClass}>
                {session.user.name} · {session.user.role} · ID {session.user.userId}
              </Text>
              <Button variant="ghost" theme={theme} onPress={() => signOut()}>
                Sign out
              </Button>
            </View>
          )}
        </Card>

        {/* ── Sync status ──────────────────────────────────────────────── */}
        {(!isOnline || pendingCount > 0) && (
          <Card variant="subtle" theme={theme}>
            <View className="flex-row items-center gap-2">
              <Text variant="caption" theme={theme}>
                {!isOnline ? "📡 Offline" : "🔄 Syncing"}
              </Text>
              {pendingCount > 0 && (
                <Text variant="caption" theme={theme} className={accentClass}>
                  {pendingCount} pending
                </Text>
              )}
            </View>
            <Text variant="caption" theme={theme} className={subtextClass}>
              {!isOnline
                ? "Data will be saved locally and synced when you're back online."
                : "Uploading queued records…"}
            </Text>
          </Card>
        )}

        {/* ── Today's summary ──────────────────────────────────────────── */}
        <Card variant="subtle" theme={theme}>
          <Text variant="title" theme={theme}>
            Today's summary
          </Text>
          {summary.isLoading && (
            <Text variant="detail" theme={theme} className={subtextClass}>
              Loading metrics…
            </Text>
          )}
          {summary.isError && (
            <Text variant="detail" theme={theme} className={subtextClass}>
              Could not load summary. The API may be offline or no farm data
              exists yet.
            </Text>
          )}
          {summary.data && (
            <View className="gap-2">
              <View className="flex-row justify-between">
                <MetricCell
                  label="🥚 Eggs"
                  value={summary.data.eggCount}
                  theme={theme}
                />
                <MetricCell
                  label="🌾 Feed"
                  value={`${(summary.data.feedGrams / 1000).toFixed(1)} kg`}
                  theme={theme}
                />
                <MetricCell
                  label="⚠️ Mortality"
                  value={summary.data.mortality}
                  theme={theme}
                />
              </View>
              <Text variant="caption" theme={theme} className={subtextClass}>
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
            <Text variant="detail" theme={theme} className={subtextClass}>
              Loading batches…
            </Text>
          )}
          {batches.isError && (
            <Text variant="detail" theme={theme} className={subtextClass}>
              Could not load batches.
            </Text>
          )}
          {batches.data?.length === 0 && (
            <Text variant="detail" theme={theme} className={subtextClass}>
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
              <Text variant="caption" theme={theme} className={accentClass}>
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
          <Text variant="detail" theme={theme} className={subtextClass}>
            {health.data
              ? `API is ${health.data.status} — ${health.data.timestamp}`
              : "Connecting to API..."}
          </Text>
        </Card>
      </Screen>
    </RoleGuard>
  );
}

/** Small metric display for the summary row. */
function MetricCell({
  label,
  value,
  theme,
}: {
  label: string;
  value: string | number;
  theme: "dark" | "light";
}) {
  return (
    <View className="items-center gap-1">
      <Text
        variant="caption"
        theme={theme}
        className={
          theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary"
        }
      >
        {label}
      </Text>
      <Text variant="title" theme={theme}>
        {value}
      </Text>
    </View>
  );
}
