import { View } from "react-native";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/providers/auth-provider";
import { useSync } from "@/providers/sync-provider";

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { health, summary, batches, cageSummary } = useDashboardData();
  const { pendingCount, isOnline } = useSync();

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";
  const secondaryClass =
    "text-light-text-secondary dark:text-dark-text-secondary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.index}>
      <Screen>
        {/* ── Welcome card ─────────────────────────────────────────────── */}
        <Card className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" className={accentClass}>
            Dashboard
          </Text>
          <Text variant="hero">Farm records{"\n"}in your pocket.</Text>
          {session && (
            <View className="gap-2.5">
              <Text variant="detail" className={secondaryClass}>
                {session.user.name} · {session.user.role} · ID{" "}
                {session.user.userId}
              </Text>
              <Button variant="ghost" onPress={() => signOut()}>
                Sign out
              </Button>
            </View>
          )}
        </Card>

        {/* ── Sync status ──────────────────────────────────────────────── */}
        {(!isOnline || pendingCount > 0) && (
          <Card variant="subtle">
            <View className="flex-row items-center gap-2">
              <Text variant="caption">
                {!isOnline ? "📡 Offline" : "🔄 Syncing"}
              </Text>
              {pendingCount > 0 && (
                <Text variant="caption" className={accentClass}>
                  {pendingCount} pending
                </Text>
              )}
            </View>
            <Text variant="caption" className={subtextClass}>
              {!isOnline
                ? "Data will be saved locally and synced when you're back online."
                : "Uploading queued records…"}
            </Text>
          </Card>
        )}

        {/* ── Today's summary ──────────────────────────────────────────── */}
        <Card variant="subtle">
          <Text variant="title">Today's summary</Text>
          {summary.isLoading && (
            <Text variant="detail" className={subtextClass}>
              Loading metrics…
            </Text>
          )}
          {summary.isError && (
            <Text variant="detail" className={subtextClass}>
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
                <MetricCell
                  label="⚠️ Mortality"
                  value={summary.data.mortality}
                />
              </View>
              <Text variant="caption" className={subtextClass}>
                {summary.data.recordCount} record
                {summary.data.recordCount === 1 ? "" : "s"} for{" "}
                {summary.data.date}
              </Text>
            </View>
          )}
        </Card>

        {/* ── Active batches ───────────────────────────────────────────── */}
        <Card variant="subtle">
          <Text variant="title">Active batches</Text>
          {batches.isLoading && (
            <Text variant="detail" className={subtextClass}>
              Loading batches…
            </Text>
          )}
          {batches.isError && (
            <Text variant="detail" className={subtextClass}>
              Could not load batches.
            </Text>
          )}
          {batches.data?.length === 0 && (
            <Text variant="detail" className={subtextClass}>
              No active batches.
            </Text>
          )}
          {batches.data?.map((batch) => (
            <View
              key={batch.id}
              className="flex-row justify-between items-center"
            >
              <Text variant="detail">{batch.name}</Text>
              <Text variant="caption" className={accentClass}>
                {batch.currentCount} birds
              </Text>
            </View>
          ))}
        </Card>

        {/* ── Cage production ──────────────────────────────────────────── */}
        {cageSummary.data && cageSummary.data.totalCages > 0 && (
          <Card variant="subtle">
            <Text variant="title">Cage production today</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <MetricCell
                  label="🥚 Cage eggs"
                  value={cageSummary.data.totalEggs}
                />
                <MetricCell
                  label="🌾 Feed"
                  value={
                    cageSummary.data.totalFeedGrams > 0
                      ? `${(cageSummary.data.totalFeedGrams / 1000).toFixed(1)} kg`
                      : "—"
                  }
                />
                <MetricCell
                  label="🐔 Birds"
                  value={cageSummary.data.totalBirds}
                />
              </View>
              <Text variant="caption" className={subtextClass}>
                {cageSummary.data.recordCount} of {cageSummary.data.totalCages}{" "}
                cages recorded
              </Text>
            </View>
          </Card>
        )}

        {/* ── API status ───────────────────────────────────────────────── */}
        <Card variant="subtle">
          <Text variant="title">API status</Text>
          <Text variant="detail" className={subtextClass}>
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
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View className="items-center gap-1">
      <Text
        variant="caption"
        className="text-light-text-tertiary dark:text-dark-text-tertiary"
      >
        {label}
      </Text>
      <Text variant="title">{value}</Text>
    </View>
  );
}
