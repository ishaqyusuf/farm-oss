import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useSync } from "@/providers/sync-provider";
import { useTRPC } from "@/trpc/client";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Calculate age in weeks from a start date. */
function ageInWeeks(startDate: string | Date): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

type ViewMode = "list" | "add" | "production";

export default function CagesScreen() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const { isOnline } = useSync();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── View state ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCageId, setSelectedCageId] = useState<string | null>(null);

  // ── Add cage form state ─────────────────────────────────────────────
  const [label, setLabel] = useState("");
  const [birdCount, setBirdCount] = useState("");
  const [cageNotes, setCageNotes] = useState("");

  // ── Production form state ───────────────────────────────────────────
  const [prodEggCount, setProdEggCount] = useState("");
  const [prodMortality, setProdMortality] = useState("");
  const [prodNotes, setProdNotes] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────
  const cageListOpts = trpc.cageUnit.list.queryOptions({
    flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
    status: "active",
  });

  const cages = useQuery(cageListOpts);

  // ── Create cage mutation ────────────────────────────────────────────
  const createCage = useMutation(
    trpc.cageUnit.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Cage unit added successfully.");
        resetAddForm();
        queryClient.invalidateQueries({ queryKey: cageListOpts.queryKey });
      },
      onError(error) {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // ── Record production mutation ──────────────────────────────────────
  const createProduction = useMutation(
    trpc.cageProduction.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Production recorded successfully.");
        resetProductionForm();
        queryClient.invalidateQueries({ queryKey: cageListOpts.queryKey });
      },
      onError(error) {
        Alert.alert("Error", error.message);
      },
    }),
  );

  function resetAddForm() {
    setLabel("");
    setBirdCount("");
    setCageNotes("");
    setViewMode("list");
  }

  function resetProductionForm() {
    setProdEggCount("");
    setProdMortality("");
    setProdNotes("");
    setSelectedCageId(null);
    setViewMode("list");
  }

  async function handleSaveCage() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }
    if (!label.trim()) {
      Alert.alert("Validation", "Please enter a cage label.");
      return;
    }
    if (!birdCount || Number(birdCount) < 0) {
      Alert.alert("Validation", "Please enter a valid bird count.");
      return;
    }

    const payload = {
      flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
      label: label.trim(),
      birdCount: Number(birdCount),
      startDate: todayISO(),
      notes: cageNotes || undefined,
    };

    if (isOnline) {
      createCage.mutate(payload);
    } else {
      await enqueue("cageUnit.create", payload);
      Alert.alert("Saved offline", "Cage unit queued and will sync when online.");
      resetAddForm();
    }
  }

  async function handleSaveProduction() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }
    if (!selectedCageId) {
      Alert.alert("Error", "No cage selected.");
      return;
    }

    const payload = {
      cageUnitId: selectedCageId,
      recordDate: todayISO(),
      eggCount: prodEggCount ? Number(prodEggCount) : 0,
      mortality: prodMortality ? Number(prodMortality) : 0,
      notes: prodNotes || undefined,
    };

    if (isOnline) {
      createProduction.mutate(payload);
    } else {
      await enqueue("cageProduction.create", payload);
      Alert.alert("Saved offline", "Production queued and will sync when online.");
      resetProductionForm();
    }
  }

  const accentClass =
    theme === "dark" ? "text-dark-accent" : "text-light-accent";
  const subtextClass =
    theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary";
  const secondaryClass =
    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary";

  // ── Add cage form ───────────────────────────────────────────────────
  if (viewMode === "add") {
    return (
      <RoleGuard allowed={SCREEN_ROLES.cages}>
        <Screen theme={theme}>
          <Card theme={theme}>
            <Text variant="tag" theme={theme} className={accentClass}>
              New cage unit
            </Text>
            <Text variant="heading" theme={theme}>
              Add a cage to the battery system
            </Text>
            {!isOnline && (
              <Text variant="caption" theme={theme} className={subtextClass}>
                📡 Offline — will sync later
              </Text>
            )}
          </Card>

          <Input
            label="Cage label"
            placeholder="e.g. A1, Row-3"
            value={label}
            onChangeText={setLabel}
            theme={theme}
          />

          <Input
            label="Bird count"
            placeholder="e.g. 6"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
            theme={theme}
          />

          <Input
            label="Notes"
            placeholder="Any notes about this cage unit"
            value={cageNotes}
            onChangeText={setCageNotes}
            multiline
            theme={theme}
          />

          <View className="gap-2.5">
            <Button
              theme={theme}
              onPress={handleSaveCage}
              disabled={createCage.isPending}
            >
              {createCage.isPending ? (
                <ActivityIndicator
                  color={theme === "dark" ? "#18210f" : "#f6f1e6"}
                />
              ) : isOnline ? (
                "Save cage unit"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button
              variant="ghost"
              theme={theme}
              onPress={() => setViewMode("list")}
            >
              Cancel
            </Button>
          </View>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Record production form ──────────────────────────────────────────
  if (viewMode === "production" && selectedCageId) {
    const selectedCage = cages.data?.find((c) => c.id === selectedCageId);
    return (
      <RoleGuard allowed={SCREEN_ROLES.cages}>
        <Screen theme={theme}>
          <Card theme={theme}>
            <Text variant="tag" theme={theme} className={accentClass}>
              Daily production
            </Text>
            <Text variant="heading" theme={theme}>
              Record for cage {selectedCage?.label ?? "—"}
            </Text>
            <Text variant="caption" theme={theme} className={subtextClass}>
              {todayISO()}
              {selectedCage &&
                ` · ${selectedCage.birdCount} birds · Age: ${ageInWeeks(selectedCage.startDate)} weeks`}
            </Text>
          </Card>

          <Input
            label="Egg count"
            placeholder="e.g. 5"
            value={prodEggCount}
            onChangeText={setProdEggCount}
            keyboardType="numeric"
            theme={theme}
          />

          <Input
            label="Mortality"
            placeholder="0"
            value={prodMortality}
            onChangeText={setProdMortality}
            keyboardType="numeric"
            theme={theme}
          />

          <Input
            label="Notes"
            placeholder="Any notes about today's production"
            value={prodNotes}
            onChangeText={setProdNotes}
            multiline
            theme={theme}
          />

          <View className="gap-2.5">
            <Button
              theme={theme}
              onPress={handleSaveProduction}
              disabled={createProduction.isPending}
            >
              {createProduction.isPending ? (
                <ActivityIndicator
                  color={theme === "dark" ? "#18210f" : "#f6f1e6"}
                />
              ) : isOnline ? (
                "Save production"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button
              variant="ghost"
              theme={theme}
              onPress={resetProductionForm}
            >
              Cancel
            </Button>
          </View>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Cage list ───────────────────────────────────────────────────────
  return (
    <RoleGuard allowed={SCREEN_ROLES.cages}>
      <Screen theme={theme}>
        <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" theme={theme} className={accentClass}>
            Battery cages
          </Text>
          <Text variant="heading" theme={theme}>
            Cage management
          </Text>
          <Text variant="detail" theme={theme} className={secondaryClass}>
            Manage individual cage units, track daily production and bird age.
          </Text>
          <Button theme={theme} onPress={() => setViewMode("add")}>
            + Add cage unit
          </Button>
        </Card>

        {cages.isLoading && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              Loading cage units…
            </Text>
          </Card>
        )}

        {cages.isError && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={accentClass}>
              Could not load cage units. The API may be offline or no flock
              batch exists yet.
            </Text>
          </Card>
        )}

        {cages.data?.length === 0 && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              No cage units yet. Tap "+ Add cage unit" to create one.
            </Text>
          </Card>
        )}

        {cages.data?.map((cage) => (
          <Pressable
            key={cage.id}
            onPress={() => {
              setSelectedCageId(cage.id);
              setViewMode("production");
            }}
          >
            <Card variant="subtle" theme={theme}>
              <View className="flex-row justify-between items-center">
                <Text variant="label" theme={theme}>
                  🏗️ {cage.label}
                </Text>
                <Text variant="caption" theme={theme} className={accentClass}>
                  {cage.birdCount} birds
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text variant="caption" theme={theme} className={secondaryClass}>
                  Age: {ageInWeeks(cage.startDate)} weeks
                </Text>
                <Text variant="caption" theme={theme} className={subtextClass}>
                  Tap to record production
                </Text>
              </View>
              {cage.notes && (
                <Text variant="caption" theme={theme} className={subtextClass}>
                  {cage.notes}
                </Text>
              )}
            </Card>
          </Pressable>
        ))}
      </Screen>
    </RoleGuard>
  );
}
