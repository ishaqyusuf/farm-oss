import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { PLACEHOLDER_FARM_ID } from "@/lib/constants";
import { formatNaira, toKobo } from "@/lib/currency";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useSync } from "@/providers/sync-provider";
import { useTheme } from "@/providers/theme-provider";
import { useTRPC } from "@/trpc/client";

const CATEGORIES = [
  "feed",
  "medication",
  "labor",
  "equipment",
  "other",
] as const;

type Category = (typeof CATEGORIES)[number];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpensesScreen() {
  const { session } = useAuth();
  const { isDark } = useTheme();
  const { isOnline } = useSync();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── View state ──────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>("feed");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // ── List query ──────────────────────────────────────────────────────
  const listKey = trpc.expense.list.queryOptions({
    farmId: PLACEHOLDER_FARM_ID,
    limit: 20,
  });

  const expenses = useQuery(listKey);

  // ── Mutation ────────────────────────────────────────────────────────
  const createExpense = useMutation(
    trpc.expense.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Expense recorded successfully.");
        resetForm();
        queryClient.invalidateQueries({ queryKey: listKey.queryKey });
      },
      onError(error) {
        Alert.alert("Error", error.message);
      },
    }),
  );

  function resetForm() {
    setCategory("feed");
    setAmount("");
    setDescription("");
    setShowForm(false);
  }

  function buildPayload() {
    return {
      farmId: PLACEHOLDER_FARM_ID,
      category,
      description: description || undefined,
      amount: toKobo(Number(amount)),
      expenseDate: todayISO(),
    };
  }

  async function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Validation", "Please enter a valid amount.");
      return;
    }

    const payload = buildPayload();

    if (isOnline) {
      createExpense.mutate(payload);
    } else {
      await enqueue("expense.create", payload);
      Alert.alert("Saved offline", "Expense queued and will sync when online.");
      resetForm();
    }
  }

  const isBusy = createExpense.isPending;

  const accentClass = "text-light-accent dark:text-dark-accent";
  const subtextClass = "text-light-text-tertiary dark:text-dark-text-tertiary";
  const secondaryClass =
    "text-light-text-secondary dark:text-dark-text-secondary";

  const selectedChipBg =
    "bg-light-accent border-light-accent dark:bg-dark-accent dark:border-dark-accent";
  const unselectedChipBg =
    "bg-light-surface border-light-border dark:bg-dark-surface dark:border-dark-border";
  const selectedChipText = "text-light-accent-text dark:text-dark-accent-text";

  // ── New expense form ────────────────────────────────────────────────
  if (showForm) {
    return (
      <RoleGuard allowed={SCREEN_ROLES.expenses}>
        <Screen>
          <Card>
            <Text variant="tag" className={accentClass}>
              New expense
            </Text>
            <Text variant="heading">Log a farm expense</Text>
            {!isOnline && (
              <Text variant="caption" className={subtextClass}>
                📡 Offline — will sync later
              </Text>
            )}
          </Card>

          <View className="gap-2">
            <Text variant="label" className={secondaryClass}>
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`border rounded-2xl px-4 py-2.5 ${
                    category === cat ? selectedChipBg : unselectedChipBg
                  }`}
                >
                  <Text
                    variant="label"
                    className={`capitalize ${category === cat ? selectedChipText : ""}`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Amount (₦)"
            placeholder="e.g. 7500"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Input
            label="Description"
            placeholder="Layer mash – 50 bags"
            value={description}
            onChangeText={setDescription}
          />

          <View className="gap-2.5">
            <Button onPress={handleSave} disabled={isBusy}>
              {isBusy ? (
                <ActivityIndicator color={isDark ? "#18210f" : "#f6f1e6"} />
              ) : isOnline ? (
                "Save expense"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button variant="ghost" onPress={() => setShowForm(false)}>
              Cancel
            </Button>
          </View>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Expense list ────────────────────────────────────────────────────
  return (
    <RoleGuard allowed={SCREEN_ROLES.expenses}>
      <Screen>
        <Card className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" className={accentClass}>
            Expenses
          </Text>
          <Text variant="heading">Farm spending</Text>
          <Button onPress={() => setShowForm(true)}>+ New expense</Button>
        </Card>

        {expenses.isLoading && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              Loading expenses…
            </Text>
          </Card>
        )}

        {expenses.isError && (
          <Card variant="subtle">
            <Text variant="detail" className={accentClass}>
              Could not load expenses. The API may be offline or no farm exists
              yet.
            </Text>
          </Card>
        )}

        {expenses.data?.length === 0 && (
          <Card variant="subtle">
            <Text variant="detail" className={subtextClass}>
              No expenses yet. Tap "+ New expense" to add one.
            </Text>
          </Card>
        )}

        {expenses.data?.map((expense) => (
          <Card key={expense.id} variant="subtle">
            <View className="flex-row justify-between items-center">
              <Text variant="label" className="capitalize">
                {expense.category}
              </Text>
              <Text variant="label" className={accentClass}>
                {formatNaira(expense.amount)}
              </Text>
            </View>
            {expense.description && (
              <Text variant="detail" className={secondaryClass}>
                {expense.description}
              </Text>
            )}
            <Text variant="caption" className={subtextClass}>
              {new Date(expense.expenseDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </Card>
        ))}
      </Screen>
    </RoleGuard>
  );
}
