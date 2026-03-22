import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, Screen, Text } from "@/components/ui";
import { dark, spacing } from "@/theme";
import { useTRPC } from "@/trpc/client";

const t = dark;

/** Demo flock batch ID — will be replaced by a flock selector. */
const DEMO_FLOCK_BATCH_ID = "00000000-0000-0000-0000-000000000001";

export default function HistoryScreen() {
  const trpc = useTRPC();

  const records = useQuery(
    trpc.dailyRecord.list.queryOptions({
      flockBatchId: DEMO_FLOCK_BATCH_ID,
      limit: 20,
    }),
  );

  return (
    <Screen theme={t}>
      <Card
        theme={t}
        style={{ gap: spacing[3.5], padding: spacing[6], borderRadius: 28 }}
      >
        <Text variant="tag" color="accent" theme={t}>
          History
        </Text>
        <Text variant="heading" theme={t}>
          Recent daily records
        </Text>
        <Text variant="detail" color="textSecondary" theme={t}>
          Showing the latest entries for the active flock batch.
        </Text>
      </Card>

      {records.isLoading && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            Loading records…
          </Text>
        </Card>
      )}

      {records.isError && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="accent" theme={t}>
            Could not load records. The API may be offline or no flock batch
            exists yet.
          </Text>
        </Card>
      )}

      {records.data?.length === 0 && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            No records yet. Use the Record tab to create your first daily entry.
          </Text>
        </Card>
      )}

      {records.data?.map((record) => (
        <Card key={record.id} variant="subtle" theme={t}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="label" theme={t}>
              {new Date(record.recordDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
            {record.mortality > 0 && (
              <Text variant="caption" color="accent" theme={t}>
                ⚠ {record.mortality} mortality
              </Text>
            )}
          </View>

          <View style={{ gap: spacing[1] }}>
            {record.eggCount != null && (
              <Text variant="detail" color="textSecondary" theme={t}>
                🥚 {record.eggCount} eggs
              </Text>
            )}
            {record.feedGrams != null && (
              <Text variant="detail" color="textSecondary" theme={t}>
                🌾 {(record.feedGrams / 1000).toFixed(1)} kg feed
              </Text>
            )}
            {record.notes && (
              <Text variant="caption" color="textTertiary" theme={t}>
                {record.notes}
              </Text>
            )}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
