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

const SALE_TYPES = ["eggs", "birds", "other"] as const;

type SaleType = (typeof SALE_TYPES)[number];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SalesScreen() {
  const { session } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── View state ──────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────
  const [saleType, setSaleType] = useState<SaleType>("eggs");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");

  // ── List query ──────────────────────────────────────────────────────
  const listKey = trpc.sale.list.queryOptions({
    farmId: PLACEHOLDER_FARM_ID,
    limit: 20,
  });

  const sales = useQuery(listKey);

  // ── Mutation ────────────────────────────────────────────────────────
  const createSale = useMutation(
    trpc.sale.create.mutationOptions({
      onSuccess() {
        Alert.alert("Saved", "Sale recorded successfully.");
        resetForm();
        queryClient.invalidateQueries({ queryKey: listKey.queryKey });
      },
      onError(error) {
        Alert.alert("Error", error.message);
      },
    }),
  );

  function resetForm() {
    setSaleType("eggs");
    setQuantity("");
    setUnitPrice("");
    setTotalAmount("");
    setDescription("");
    setShowForm(false);
  }

  /** Compute total from qty × unit price, or use manually entered total. */
  function resolvedTotal(): number {
    if (totalAmount) return Math.round(Number(totalAmount) * 100);
    if (quantity && unitPrice)
      return Math.round(Number(quantity) * Number(unitPrice) * 100);
    return 0;
  }

  function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in from the Home tab.");
      return;
    }
    const total = resolvedTotal();
    if (total <= 0) {
      Alert.alert(
        "Validation",
        "Enter a total amount, or quantity and unit price.",
      );
      return;
    }

    createSale.mutate({
      farmId: PLACEHOLDER_FARM_ID,
      saleType,
      description: description || undefined,
      quantity: quantity ? Number(quantity) : undefined,
      unitPrice: unitPrice ? Math.round(Number(unitPrice) * 100) : undefined,
      totalAmount: total,
      saleDate: todayISO(),
    });
  }

  const isBusy = createSale.isPending;

  // ── New sale form ───────────────────────────────────────────────────
  if (showForm) {
    return (
      <Screen theme={t}>
        <Card theme={t}>
          <Text variant="tag" color="accent" theme={t}>
            New sale
          </Text>
          <Text variant="heading" theme={t}>
            Record a sale
          </Text>
        </Card>

        <View style={{ gap: spacing[2] }}>
          <Text variant="label" color="textSecondary" theme={t}>
            Sale type
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing[2],
            }}
          >
            {SALE_TYPES.map((st) => (
              <Pressable
                key={st}
                onPress={() => setSaleType(st)}
                style={{
                  backgroundColor: saleType === st ? t.accent : t.surface,
                  borderColor: saleType === st ? t.accent : t.border,
                  borderWidth: 1,
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2.5],
                }}
              >
                <Text
                  variant="label"
                  color={saleType === st ? "accentText" : "text"}
                  theme={t}
                  style={{ textTransform: "capitalize" }}
                >
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          label="Quantity"
          placeholder="e.g. 50"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          theme={t}
        />

        <Input
          label="Unit price (₦)"
          placeholder="e.g. 3500"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
          theme={t}
        />

        <Input
          label="Total amount (₦)"
          placeholder={
            quantity && unitPrice
              ? `${(Number(quantity) * Number(unitPrice)).toLocaleString()} (auto)`
              : "e.g. 175000"
          }
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="numeric"
          theme={t}
        />

        <Input
          label="Description"
          placeholder="Crate sales – wholesale"
          value={description}
          onChangeText={setDescription}
          theme={t}
        />

        <View style={{ gap: spacing[2.5] }}>
          <Button theme={t} onPress={handleSave} disabled={isBusy}>
            {isBusy ? <ActivityIndicator color={t.accentText} /> : "Save sale"}
          </Button>
          <Button variant="ghost" theme={t} onPress={() => setShowForm(false)}>
            Cancel
          </Button>
        </View>
      </Screen>
    );
  }

  // ── Sales list ──────────────────────────────────────────────────────
  return (
    <Screen theme={t}>
      <Card
        theme={t}
        style={{ gap: spacing[3.5], padding: spacing[6], borderRadius: 28 }}
      >
        <Text variant="tag" color="accent" theme={t}>
          Sales
        </Text>
        <Text variant="heading" theme={t}>
          Revenue log
        </Text>
        <Button theme={t} onPress={() => setShowForm(true)}>
          + New sale
        </Button>
      </Card>

      {sales.isLoading && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            Loading sales…
          </Text>
        </Card>
      )}

      {sales.isError && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="accent" theme={t}>
            Could not load sales. The API may be offline or no farm exists yet.
          </Text>
        </Card>
      )}

      {sales.data?.length === 0 && (
        <Card variant="subtle" theme={t}>
          <Text variant="detail" color="textTertiary" theme={t}>
            No sales yet. Tap "+ New sale" to add one.
          </Text>
        </Card>
      )}

      {sales.data?.map((sale) => (
        <Card key={sale.id} variant="subtle" theme={t}>
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
              {sale.saleType}
            </Text>
            <Text variant="label" color="accent" theme={t}>
              ₦{(sale.totalAmount / 100).toLocaleString()}
            </Text>
          </View>
          {sale.quantity != null && (
            <Text variant="detail" color="textSecondary" theme={t}>
              {sale.quantity} units
              {sale.unitPrice != null &&
                ` × ₦${(sale.unitPrice / 100).toLocaleString()}`}
            </Text>
          )}
          {sale.description && (
            <Text variant="detail" color="textSecondary" theme={t}>
              {sale.description}
            </Text>
          )}
          <Text variant="caption" color="textTertiary" theme={t}>
            {new Date(sale.saleDate).toLocaleDateString("en-GB", {
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
