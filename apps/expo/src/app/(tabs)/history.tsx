import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Screen, Text } from "@/components/ui";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";

const theme = "dark" as const;

export default function HistoryScreen() {
  const trpc = useTRPC();

  const records = useQuery(
    trpc.dailyRecord.list.queryOptions({
      flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
      limit: 20,
    }),
  );

  return (
    <Screen theme={theme}>
      <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
        <Text variant="tag" theme={theme} className="text-dark-accent">
          History
        </Text>
        <Text variant="heading" theme={theme}>
          Recent daily records
        </Text>
        <Text variant="detail" theme={theme} className="text-dark-text-secondary">
          Showing the latest entries for the active flock batch.
        </Text>
      </Card>

      {records.isLoading && (
        <Card variant="subtle" theme={theme}>
          <Text variant="detail" theme={theme} className="text-dark-text-tertiary">
            Loading records…
          </Text>
        </Card>
      )}

      {records.isError && (
        <Card variant="subtle" theme={theme}>
          <Text variant="detail" theme={theme} className="text-dark-accent">
            Could not load records. The API may be offline or no flock batch
            exists yet.
          </Text>
        </Card>
      )}

      {records.data?.length === 0 && (
        <Card variant="subtle" theme={theme}>
          <Text variant="detail" theme={theme} className="text-dark-text-tertiary">
            No records yet. Use the Record tab to create your first daily entry.
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
              <Text variant="caption" theme={theme} className="text-dark-accent">
                ⚠ {record.mortality} mortality
              </Text>
            )}
          </View>

          <View className="gap-1">
            {record.eggCount != null && (
              <Text variant="detail" theme={theme} className="text-dark-text-secondary">
                🥚 {record.eggCount} eggs
              </Text>
            )}
            {record.feedGrams != null && (
              <Text variant="detail" theme={theme} className="text-dark-text-secondary">
                🌾 {(record.feedGrams / 1000).toFixed(1)} kg feed
              </Text>
            )}
            {record.notes && (
              <Text variant="caption" theme={theme} className="text-dark-text-tertiary">
                {record.notes}
              </Text>
            )}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
