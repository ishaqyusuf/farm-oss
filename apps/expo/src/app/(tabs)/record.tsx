import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { useTRPC } from "@/trpc/client";

const theme = "light" as const;

/** Format today as YYYY-MM-DD. */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordScreen() {
  const { session } = useAuth();
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

  function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in from the Home tab.");
      return;
    }

    createRecord.mutate({
      flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
      recordDate: todayISO(),
      feedGrams: feedKg ? Math.round(Number(feedKg) * 1000) : undefined,
      eggCount: eggCount ? Number(eggCount) : undefined,
      mortality: mortality ? Number(mortality) : 0,
      notes: notes || undefined,
    });
  }

  const isBusy = createRecord.isPending;

  return (
    <Screen theme={theme}>
      <Card theme={theme}>
        <Text variant="tag" theme={theme} className="text-light-accent">
          Quick entry
        </Text>
        <Text variant="heading" theme={theme}>
          Record today's flock activity in under a minute.
        </Text>
        <Text
          variant="caption"
          theme={theme}
          className="text-light-text-tertiary"
        >
          {todayISO()}
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
          {isBusy ? <ActivityIndicator color="#f6f1e6" /> : "Save daily record"}
        </Button>
        {createRecord.isSuccess && (
          <Text variant="caption" theme={theme} className="text-light-accent">
            ✓ Record saved
          </Text>
        )}
      </View>
    </Screen>
  );
}
