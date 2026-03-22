import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { PLACEHOLDER_FLOCK_BATCH_ID } from "@/lib/constants";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useSync } from "@/providers/sync-provider";
import { useTheme } from "@/providers/theme-provider";
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

type ViewMode = "list" | "add" | "detail" | "production";

export default function CagesScreen() {
  const { session } = useAuth();
  const { isDark } = useTheme();
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
  const [prodFeedKg, setProdFeedKg] = useState("");
  const [prodMortality, setProdMortality] = useState("");
  const [prodNotes, setProdNotes] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────
  const cageListOpts = trpc.cageUnit.list.queryOptions({
    flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
    status: "active",
  });

  const cages = useQuery(cageListOpts);

  // ── Production history query (only when viewing detail) ─────────────
  const productionHistory = useQuery({
    ...trpc.cageProduction.list.queryOptions({
      cageUnitId: selectedCageId ?? "",
      limit: 14,
    }),
    enabled: viewMode === "detail" && !!selectedCageId,
  });

  // ── Cage summary query ──────────────────────────────────────────────
  const cageSummaryOpts = trpc.cageProduction.summary.queryOptions({
    flockBatchId: PLACEHOLDER_FLOCK_BATCH_ID,
  });

  const cageSummary = useQuery(cageSummaryOpts);

  // ── Create cage mutation ────────────────────────────────────────────
  const createCage = useMutation(
    trpc.cageUnit.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Cage unit added successfully.");
        resetAddForm();
        queryClient.invalidateQueries({ queryKey: cageListOpts.queryKey });
        queryClient.invalidateQueries({ queryKey: cageSummaryOpts.queryKey });
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
        queryClient.invalidateQueries({ queryKey: cageSummaryOpts.queryKey });
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
    setProdFeedKg("");
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
    if (!birdCount || Number(birdCount) <= 0) {
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
      Alert.alert(
        "Saved offline",
        "Cage unit queued and will sync when online.",
      );
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
      feedGrams: prodFeedKg ? Math.round(Number(prodFeedKg) * 1000) : undefined,
      mortality: prodMortality ? Number(prodMortality) : 0,
      notes: prodNotes || undefined,
    };

    if (isOnline) {
      createProduction.mutate(payload);
    } else {
      await enqueue("cageProduction.create", payload);
      Alert.alert(
        "Saved offline",
        "Production queued and will sync when online.",
      );
      resetProductionForm();
    }
  }

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";
  const secondaryClass =
    "text-light-text-secondary dark:text-dark-text-secondary";

  // ── Add cage form ───────────────────────────────────────────────────
  if (viewMode === "add") {
    return (
      <RoleGuard allowed={SCREEN_ROLES.cages}>
        <Screen>
          <Card>
            <Text variant="tag" className={accentClass}>
              New cage unit
            </Text>
            <Text variant="heading">Add a cage to the battery system</Text>
            {!isOnline && (
              <Text variant="caption" className={subtextClass}>
                📡 Offline — will sync later
              </Text>
            )}
          </Card>

          <Input
            label="Cage label"
            placeholder="e.g. A1, Row-3"
            value={label}
            onChangeText={setLabel}
          />

          <Input
            label="Bird count"
            placeholder="e.g. 6"
            value={birdCount}
            onChangeText={setBirdCount}
            keyboardType="numeric"
          />

          <Input
            label="Notes"
            placeholder="Any notes about this cage unit"
            value={cageNotes}
            onChangeText={setCageNotes}
            multiline
          />

          <View className="gap-2.5">
            <Button onPress={handleSaveCage} disabled={createCage.isPending}>
              {createCage.isPending ? (
                <ActivityIndicator color={isDark ? "#18210f" : "#f6f1e6"} />
              ) : isOnline ? (
                "Save cage unit"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button variant="ghost" onPress={() => setViewMode("list")}>
              Cancel
            </Button>
          </View>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Cage detail / history view ──────────────────────────────────────
  if (viewMode === "detail" && selectedCageId) {
    const selectedCage = cages.data?.find((c) => c.id === selectedCageId);
    const history = productionHistory.data ?? [];
    return (
      <RoleGuard allowed={SCREEN_ROLES.cages}>
        <Screen>
          <Card className="gap-3.5 p-6 rounded-[28px]">
            <Text variant="tag" className={accentClass}>
              Cage details
            </Text>
            <Text variant="heading">{selectedCage?.label ?? "—"}</Text>
            {selectedCage && (
              <View className="gap-1">
                <Text variant="detail" className={secondaryClass}>
                  🐔 {selectedCage.birdCount} birds · Age:{" "}
                  {ageInWeeks(selectedCage.startDate)} weeks
                </Text>
                <Text variant="caption" className={subtextClass}>
                  Started{" "}
                  {new Date(selectedCage.startDate).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </Text>
                {selectedCage.notes && (
                  <Text variant="caption" className={subtextClass}>
                    {selectedCage.notes}
                  </Text>
                )}
              </View>
            )}
            <View className="flex-row gap-2">
              <Button onPress={() => setViewMode("production")}>
                ✏️ Record production
              </Button>
            </View>
          </Card>

          {/* ── Production history ────────────────────────────────────── */}
          <Card variant="subtle">
            <Text variant="title">Production history</Text>

            {productionHistory.isLoading && (
              <Text variant="detail" className={subtextClass}>
                Loading records…
              </Text>
            )}

            {productionHistory.isError && (
              <Text variant="detail" className={accentClass}>
                Could not load production history.
              </Text>
            )}

            {history.length === 0 && !productionHistory.isLoading && (
              <Text variant="detail" className={subtextClass}>
                No production records yet for this cage.
              </Text>
            )}
          </Card>

          {history.map((record) => (
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
                <Text variant="detail" className={secondaryClass}>
                  🥚 {record.eggCount} eggs
                </Text>
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

          <Button
            variant="ghost"
            onPress={() => {
              setSelectedCageId(null);
              setViewMode("list");
            }}
          >
            ← Back to cages
          </Button>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Record production form ──────────────────────────────────────────
  if (viewMode === "production" && selectedCageId) {
    const selectedCage = cages.data?.find((c) => c.id === selectedCageId);
    return (
      <RoleGuard allowed={SCREEN_ROLES.cages}>
        <Screen>
          <Card>
            <Text variant="tag" className={accentClass}>
              Daily production
            </Text>
            <Text variant="heading">
              Record for cage {selectedCage?.label ?? "—"}
            </Text>
            <Text variant="caption" className={subtextClass}>
              {todayISO()}
              {selectedCage
                ? ` · ${selectedCage.birdCount} birds · Age: ${ageInWeeks(selectedCage.startDate)} weeks`
                : ""}
            </Text>
          </Card>

          <Input
            label="Egg count"
            placeholder="e.g. 5"
            value={prodEggCount}
            onChangeText={setProdEggCount}
            keyboardType="numeric"
          />

          <Input
            label="Feed given (kg)"
            placeholder="e.g. 0.5"
            value={prodFeedKg}
            onChangeText={setProdFeedKg}
            keyboardType="numeric"
          />

          <Input
            label="Mortality"
            placeholder="0"
            value={prodMortality}
            onChangeText={setProdMortality}
            keyboardType="numeric"
          />

          <Input
            label="Notes"
            placeholder="Any notes about today's production"
            value={prodNotes}
            onChangeText={setProdNotes}
            multiline
          />

          <View className="gap-2.5">
            <Button
              onPress={handleSaveProduction}
              disabled={createProduction.isPending}
            >
              {createProduction.isPending ? (
                <ActivityIndicator color={isDark ? "#18210f" : "#f6f1e6"} />
              ) : isOnline ? (
                "Save production"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button variant="ghost" onPress={resetProductionForm}>
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
      <Screen>
        <Card className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" className={accentClass}>
            Battery cages
          </Text>
          <Text variant="heading">Cage management</Text>
          <Text variant="detail" className={secondaryClass}>
            Manage individual cage units, track daily production and bird age.
          </Text>
          <Button onPress={() => setViewMode("add")}>+ Add cage unit</Button>
        </Card>

        {/* ── Today's cage summary ───────────────────────────────────── */}
        {cageSummary.data && cageSummary.data.totalCages > 0 && (
          <Card variant="subtle">
            <Text variant="title">Today's cage summary</Text>
            <View className="flex-row justify-between">
              <SummaryCell label="🥚 Eggs" value={cageSummary.data.totalEggs} />
              <SummaryCell
                label="🌾 Feed"
                value={
                  cageSummary.data.totalFeedGrams > 0
                    ? `${(cageSummary.data.totalFeedGrams / 1000).toFixed(1)} kg`
                    : "—"
                }
              />
              <SummaryCell
                label="⚠️ Mort."
                value={cageSummary.data.totalMortality}
              />
              <SummaryCell
                label="🐔 Birds"
                value={cageSummary.data.totalBirds}
              />
            </View>
            <Text variant="caption" className={subtextClass}>
              {cageSummary.data.recordCount} of {cageSummary.data.totalCages}{" "}
              cages recorded · {cageSummary.data.date}
            </Text>
          </Card>
        )}

        {cages.isLoading && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              Loading cage units…
            </Text>
          </Card>
        )}

        {cages.isError && (
          <Card variant="subtle">
            <Text variant="detail" className={accentClass}>
              Could not load cage units. The API may be offline or no flock
              batch exists yet.
            </Text>
          </Card>
        )}

        {cages.data?.length === 0 && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              No cage units yet. Tap "+ Add cage unit" to create one.
            </Text>
          </Card>
        )}

        {cages.data?.map((cage) => (
          <Pressable
            key={cage.id}
            onPress={() => {
              setSelectedCageId(cage.id);
              setViewMode("detail");
            }}
          >
            <Card variant="subtle">
              <View className="flex-row justify-between items-center">
                <Text variant="label">🏗️ {cage.label}</Text>
                <Text variant="caption" className={accentClass}>
                  {cage.birdCount} birds
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text variant="caption" className={secondaryClass}>
                  Age: {ageInWeeks(cage.startDate)} weeks
                </Text>
                <Text variant="caption" className={subtextClass}>
                  Tap for details →
                </Text>
              </View>
              {cage.notes && (
                <Text variant="caption" className={subtextClass}>
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

/** Small metric display for the cage summary row. */
function SummaryCell({
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
