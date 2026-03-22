import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Screen, Text } from "@/components/ui";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { useTheme } from "@/providers/theme-provider";
import { useTRPC } from "@/trpc/client";

export default function HistoryScreen() {
  const { theme } = useTheme();
  const trpc = useTRPC();

  const records = useQuery(
    trpc.dailyRecord.list.queryOptions({
      flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
      limit: 20,
    }),
  );

  const accentClass =
    theme === "dark" ? "text-dark-accent" : "text-light-accent";
  const subtextClass =
    theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary";
  const secondaryClass =
    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.history}>
      <Screen theme={theme}>
        <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" theme={theme} className={accentClass}>
            History
          </Text>
          <Text variant="heading" theme={theme}>
            Recent daily records
          </Text>
          <Text variant="detail" theme={theme} className={secondaryClass}>
            Showing the latest entries for the active flock batch.
          </Text>
        </Card>

        {records.isLoading && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              Loading records…
            </Text>
          </Card>
        )}

        {records.isError && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={accentClass}>
              Could not load records. The API may be offline or no flock batch
              exists yet.
            </Text>
          </Card>
        )}

        {records.data?.length === 0 && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              No records yet. Use the Record tab to create your first daily
              entry.
            </Text>
          </Card>
        )}

        {records.data?.map((record) => (
          <Card key={record.id} variant="subtle" theme={theme}>
            <View className="flex-row justify-between items-center">
              <Text variant="label" theme={theme}>
                {new Date(record.recordDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              {record.mortality > 0 && (
                <Text variant="caption" theme={theme} className={accentClass}>
                  ⚠ {record.mortality} mortality
                </Text>
              )}
            </View>

            <View className="gap-1">
              {record.eggCount != null && (
                <Text variant="detail" theme={theme} className={secondaryClass}>
                  🥚 {record.eggCount} eggs
                </Text>
              )}
              {record.feedGrams != null && (
                <Text variant="detail" theme={theme} className={secondaryClass}>
                  🌾 {(record.feedGrams / 1000).toFixed(1)} kg feed
                </Text>
              )}
              {record.notes && (
                <Text variant="caption" theme={theme} className={subtextClass}>
                  {record.notes}
                </Text>
              )}
            </View>
          </Card>
        ))}
      </Screen>
    </RoleGuard>
  );
}
