import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useFarm } from "@/providers/farm-provider";
import { useSync } from "@/providers/sync-provider";
import { useTheme } from "@/providers/theme-provider";
import { useTRPC } from "@/trpc/client";

/** Format today as YYYY-MM-DD. */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordScreen() {
  const { session } = useAuth();
  const { selectedBatch } = useFarm();
  const { isDark } = useTheme();
  const { isOnline } = useSync();
  const trpc = useTRPC();

  // ── Form state ────────────────────────────────────────────────────
  const [feedKg, setFeedKg] = useState("");
  const [eggCount, setEggCount] = useState("");
  const [mortality, setMortality] = useState("");
  const [notes, setNotes] = useState("");

  // ── Mutation ──────────────────────────────────────────────────────
  const createRecord = useMutation(
    trpc.dailyRecord.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Daily record saved successfully.");
        resetForm();
      },
      onError(error) {
        Alert.alert("Error", error.message);
      },
    }),
  );

  function resetForm() {
    setFeedKg("");
    setEggCount("");
    setMortality("");
    setNotes("");
  }

  function buildPayload() {
    return {
      flockBatchId: selectedBatch?.id ?? "",
      recordDate: todayISO(),
      feedGrams: feedKg ? Math.round(Number(feedKg) * 1000) : undefined,
      eggCount: eggCount ? Number(eggCount) : undefined,
      mortality: mortality ? Number(mortality) : 0,
      notes: notes || undefined,
    };
  }

  async function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }
    if (!selectedBatch) {
      Alert.alert("No batch selected", "Please select an active flock batch first.");
      return;
    }

    const payload = buildPayload();

    if (isOnline) {
      createRecord.mutate(payload);
    } else {
      await enqueue("dailyRecord.create", payload);
      Alert.alert("Saved offline", "Record queued and will sync when online.");
      resetForm();
    }
  }

  const isBusy = createRecord.isPending;

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.record}>
      <Screen>
        <Card>
          <Text variant="tag" className={accentClass}>
            Quick entry
          </Text>
          <Text variant="heading">
            Record today's flock activity in under a minute.
          </Text>
          <Text variant="caption" className={subtextClass}>
            {todayISO()}
            {!isOnline && "  ·  📡 Offline mode"}
          </Text>
        </Card>

        <Input
          label="Feed given (kg)"
          placeholder="e.g. 125"
          value={feedKg}
          onChangeText={setFeedKg}
          keyboardType="numeric"
        />

        <Input
          label="Egg count"
          placeholder="e.g. 842"
          value={eggCount}
          onChangeText={setEggCount}
          keyboardType="numeric"
        />

        <Input
          label="Mortality"
          placeholder="0"
          value={mortality}
          onChangeText={setMortality}
          keyboardType="numeric"
        />

        <Input
          label="Notes"
          placeholder="Birds active. Water line checked."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View className="gap-2.5">
          <Button onPress={handleSave} disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator color={isDark ? "#18210f" : "#f6f1e6"} />
            ) : isOnline ? (
              "Save daily record"
            ) : (
              "Save offline"
            )}
          </Button>
          {createRecord.isSuccess && (
            <Text variant="caption" className={accentClass}>
              ✓ Record saved
            </Text>
          )}
        </View>
      </Screen>
    </RoleGuard>
  );
}
