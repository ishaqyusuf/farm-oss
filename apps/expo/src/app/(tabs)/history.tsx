import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { Card, Screen, Text } from "@/components/ui";
import { useFarm } from "@/providers/farm-provider";
import { useTRPC } from "@/trpc/client";

export default function HistoryScreen() {
  const trpc = useTRPC();
  const { selectedBatch } = useFarm();

  const records = useQuery({
    ...trpc.dailyRecord.list.queryOptions({
      flockBatchId: selectedBatch?.id ?? "",
      limit: 20,
    }),
    enabled: !!selectedBatch,
  });

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";
  const secondaryClass =
    "text-light-text-secondary dark:text-dark-text-secondary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.history}>
      <Screen>
        <Card className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" className={accentClass}>
            History
          </Text>
          <Text variant="heading">Recent daily records</Text>
          <Text variant="detail" className={secondaryClass}>
            Showing the latest entries for the active flock batch.
          </Text>
        </Card>

        {records.isLoading && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              Loading records…
            </Text>
          </Card>
        )}

        {records.isError && (
          <Card variant="subtle">
            <Text variant="detail" className={accentClass}>
              Could not load records. The API may be offline or no flock batch
              exists yet.
            </Text>
          </Card>
        )}

        {records.data?.length === 0 && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              No records yet. Use the Record tab to create your first daily
              entry.
            </Text>
          </Card>
        )}

        {records.data?.map((record) => (
          <Card key={record.id} variant="subtle">
            <View className="flex-row justify-between items-center">
              <Text variant="label">
                {new Date(record.recordDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              {record.mortality > 0 && (
                <Text variant="caption" className={accentClass}>
                  ⚠ {record.mortality} mortality
                </Text>
              )}
            </View>

            <View className="gap-1">
              {record.eggCount != null && (
                <Text variant="detail" className={secondaryClass}>
                  🥚 {record.eggCount} eggs
                </Text>
              )}
              {record.feedGrams != null && (
                <Text variant="detail" className={secondaryClass}>
                  🌾 {(record.feedGrams / 1000).toFixed(1)} kg feed
                </Text>
              )}
              {record.notes && (
                <Text variant="caption" className={subtextClass}>
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
