import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { PLACEHOLDER_FARM_ID } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { light, spacing } from "@/theme";
import { radii } from "@/theme/spacing";
import { useTRPC } from "@/trpc/client";

const t = light;

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

  function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in from the Home tab.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Validation", "Please enter a valid amount.");
      return;
    }

    createExpense.mutate({
      farmId: PLACEHOLDER_FARM_ID,
      category,
      description: description || undefined,
      amount: Math.round(Number(amount) * 100),
      expenseDate: todayISO(),
    });
  }

  const isBusy = createExpense.isPending;

  // ── New expense form ────────────────────────────────────────────────
  if (showForm) {
    return (
      <Screen theme={t}>
        <Card theme={t}>
          <Text variant="tag" color="accent" theme={t}>
            New expense
          </Text>
          <Text variant="heading" theme={t}>
            Log a farm expense
          </Text>
        </Card>

        <View style={{ gap: spacing[2] }}>
          <Text variant="label" color="textSecondary" theme={t}>
            Category
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing[2],
            }}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  backgroundColor: category === cat ? t.accent : t.surface,
                  borderColor: category === cat ? t.accent : t.border,
                  borderWidth: 1,
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2.5],
                }}
              >
                <Text
                  variant="label"
                  color={category === cat ? "accentText" : "text"}
                  theme={t}
                  style={{ textTransform: "capitalize" }}
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
          theme={t}
        />

        <Input
          label="Description"
          placeholder="Layer mash – 50 bags"
          value={description}
          onChangeText={setDescription}
          theme={t}
        />

        <View style={{ gap: spacing[2.5] }}>
          <Button theme={t} onPress={handleSave} disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator color={t.accentText} />
            ) : (
              "Save expense"
            )}
          </Button>
          <Button variant="ghost" theme={t} onPress={() => setShowForm(false)}>
            Cancel
          </Button>
        </View>
      </Screen>
    );
  }

  // ── Expense list ────────────────────────────────────────────────────
  return (
    <Screen theme={t}>
      <Card
        theme={t}
        style={{ gap: spacing[3.5], padding: spacing[6], borderRadius: 28 }}
      >
        <Text variant="tag" color="accent" theme={t}>
          Expenses
        </Text>
        <Text variant="heading" theme={t}>
          Farm spending
        </Text>
        <Button theme={t} onPress={() => setShowForm(true)}>
          + New expense
        </Button>
      </Card>

      {expenses.isLoading && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            Loading expenses…
          </Text>
        </Card>
      )}

      {expenses.isError && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="accent" theme={t}>
            Could not load expenses. The API may be offline or no farm exists
            yet.
          </Text>
        </Card>
      )}

      {expenses.data?.length === 0 && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            No expenses yet. Tap "+ New expense" to add one.
          </Text>
        </Card>
      )}

      {expenses.data?.map((expense) => (
        <Card key={expense.id} variant="subtle" theme={t}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              variant="label"
              theme={t}
              style={{ textTransform: "capitalize" }}
            >
              {expense.category}
            </Text>
            <Text variant="label" color="accent" theme={t}>
              ₦{(expense.amount / 100).toLocaleString()}
            </Text>
          </View>
          {expense.description && (
            <Text variant="detail" color="textSecondary" theme={t}>
              {expense.description}
            </Text>
          )}
          <Text variant="caption" color="textTertiary" theme={t}>
            {new Date(expense.expenseDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
