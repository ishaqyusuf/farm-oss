import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useSync } from "@/providers/sync-provider";
import { useTRPC } from "@/trpc/client";

/** Format today as YYYY-MM-DD. */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordScreen() {
  const { session } = useAuth();
  const { theme } = useTheme();
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
      flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
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

  const accentClass =
    theme === "dark" ? "text-dark-accent" : "text-light-accent";
  const subtextClass =
    theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary";

  return (
    <RoleGuard allowed={SCREEN_ROLES.record}>
      <Screen theme={theme}>
        <Card theme={theme}>
          <Text variant="tag" theme={theme} className={accentClass}>
            Quick entry
          </Text>
          <Text variant="heading" theme={theme}>
            Record today's flock activity in under a minute.
          </Text>
          <Text variant="caption" theme={theme} className={subtextClass}>
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
          theme={theme}
        />

        <Input
          label="Egg count"
          placeholder="e.g. 842"
          value={eggCount}
          onChangeText={setEggCount}
          keyboardType="numeric"
          theme={theme}
        />

        <Input
          label="Mortality"
          placeholder="0"
          value={mortality}
          onChangeText={setMortality}
          keyboardType="numeric"
          theme={theme}
        />

        <Input
          label="Notes"
          placeholder="Birds active. Water line checked."
          value={notes}
          onChangeText={setNotes}
          multiline
          theme={theme}
        />

        <View className="gap-2.5">
          <Button theme={theme} onPress={handleSave} disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator
                color={theme === "dark" ? "#18210f" : "#f6f1e6"}
              />
            ) : isOnline ? (
              "Save daily record"
            ) : (
              "Save offline"
            )}
          </Button>
          {createRecord.isSuccess && (
            <Text variant="caption" theme={theme} className={accentClass}>
              ✓ Record saved
            </Text>
          )}
        </View>
      </Screen>
    </RoleGuard>
  );
}
