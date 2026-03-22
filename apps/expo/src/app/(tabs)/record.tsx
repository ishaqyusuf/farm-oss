import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { light, spacing } from "@/theme";
import { useTRPC } from "@/trpc/client";

const t = light;

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

    // Demo flock batch ID — in production this comes from a flock selector
    const demoFlockBatchId = "00000000-0000-0000-0000-000000000001";

    createRecord.mutate({
      flockBatchId: demoFlockBatchId,
      recordDate: todayISO(),
      feedGrams: feedKg ? Math.round(Number(feedKg) * 1000) : undefined,
      eggCount: eggCount ? Number(eggCount) : undefined,
      mortality: mortality ? Number(mortality) : 0,
      notes: notes || undefined,
    });
  }

  const isBusy = createRecord.isPending;

  return (
    <Screen theme={t}>
      <Card theme={t}>
        <Text variant="tag" color="accent" theme={t}>
          Quick entry
        </Text>
        <Text variant="heading" theme={t}>
          Record today's flock activity in under a minute.
        </Text>
        <Text variant="caption" color="textTertiary" theme={t}>
          {todayISO()}
        </Text>
      </Card>

      <Input
        label="Feed given (kg)"
        placeholder="e.g. 125"
        value={feedKg}
        onChangeText={setFeedKg}
        keyboardType="numeric"
        theme={t}
      />

      <Input
        label="Egg count"
        placeholder="e.g. 842"
        value={eggCount}
        onChangeText={setEggCount}
        keyboardType="numeric"
        theme={t}
      />

      <Input
        label="Mortality"
        placeholder="0"
        value={mortality}
        onChangeText={setMortality}
        keyboardType="numeric"
        theme={t}
      />

      <Input
        label="Notes"
        placeholder="Birds active. Water line checked."
        value={notes}
        onChangeText={setNotes}
        multiline
        theme={t}
      />

      <View style={{ gap: spacing[2.5] }}>
        <Button theme={t} onPress={handleSave} disabled={isBusy}>
          {isBusy ? (
            <ActivityIndicator color={t.accentText} />
          ) : (
            "Save daily record"
          )}
        </Button>
        {createRecord.isSuccess && (
          <Text variant="caption" color="accent" theme={t}>
            ✓ Record saved
          </Text>
        )}
      </View>
    </Screen>
  );
}
