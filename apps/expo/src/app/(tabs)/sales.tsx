import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { RoleGuard, SCREEN_ROLES } from "@/components/RoleGuard";
import { PLACEHOLDER_FARM_ID } from "@/lib/constants";
import { formatNaira, toKobo } from "@/lib/currency";
import { enqueue } from "@/lib/offline-queue";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useSync } from "@/providers/sync-provider";
import { useTRPC } from "@/trpc/client";

const SALE_TYPES = ["eggs", "birds", "other"] as const;

type SaleType = (typeof SALE_TYPES)[number];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SalesScreen() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const { isOnline } = useSync();
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
    if (totalAmount) return toKobo(Number(totalAmount));
    if (quantity && unitPrice)
      return toKobo(Number(quantity) * Number(unitPrice));
    return 0;
  }

  function buildPayload() {
    return {
      farmId: PLACEHOLDER_FARM_ID,
      saleType,
      description: description || undefined,
      quantity: quantity ? Number(quantity) : undefined,
      unitPrice: unitPrice ? toKobo(Number(unitPrice)) : undefined,
      totalAmount: resolvedTotal(),
      saleDate: todayISO(),
    };
  }

  async function handleSave() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in first.");
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

    const payload = buildPayload();

    if (isOnline) {
      createSale.mutate(payload);
    } else {
      await enqueue("sale.create", payload);
      Alert.alert("Saved offline", "Sale queued and will sync when online.");
      resetForm();
    }
  }

  const isBusy = createSale.isPending;

  const accentClass =
    theme === "dark" ? "text-dark-accent" : "text-light-accent";
  const subtextClass =
    theme === "dark" ? "text-dark-text-tertiary" : "text-light-text-tertiary";
  const secondaryClass =
    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary";

  const selectedChipBg =
    theme === "dark"
      ? "bg-dark-accent border-dark-accent"
      : "bg-light-accent border-light-accent";
  const unselectedChipBg =
    theme === "dark"
      ? "bg-dark-surface border-dark-border"
      : "bg-light-surface border-light-border";
  const selectedChipText =
    theme === "dark" ? "text-dark-accent-text" : "text-light-accent-text";

  // ── New sale form ───────────────────────────────────────────────────
  if (showForm) {
    return (
      <RoleGuard allowed={SCREEN_ROLES.sales}>
        <Screen theme={theme}>
          <Card theme={theme}>
            <Text variant="tag" theme={theme} className={accentClass}>
              New sale
            </Text>
            <Text variant="heading" theme={theme}>
              Record a sale
            </Text>
            {!isOnline && (
              <Text variant="caption" theme={theme} className={subtextClass}>
                📡 Offline — will sync later
              </Text>
            )}
          </Card>

          <View className="gap-2">
            <Text variant="label" theme={theme} className={secondaryClass}>
              Sale type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SALE_TYPES.map((st) => (
                <Pressable
                  key={st}
                  onPress={() => setSaleType(st)}
                  className={`border rounded-2xl px-4 py-2.5 ${
                    saleType === st ? selectedChipBg : unselectedChipBg
                  }`}
                >
                  <Text
                    variant="label"
                    theme={theme}
                    className={`capitalize ${saleType === st ? selectedChipText : ""}`}
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
            theme={theme}
          />

          <Input
            label="Unit price (₦)"
            placeholder="e.g. 3500"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
            theme={theme}
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
            theme={theme}
          />

          <Input
            label="Description"
            placeholder="Crate sales – wholesale"
            value={description}
            onChangeText={setDescription}
            theme={theme}
          />

          <View className="gap-2.5">
            <Button theme={theme} onPress={handleSave} disabled={isBusy}>
              {isBusy ? (
                <ActivityIndicator
                  color={theme === "dark" ? "#18210f" : "#f6f1e6"}
                />
              ) : isOnline ? (
                "Save sale"
              ) : (
                "Save offline"
              )}
            </Button>
            <Button
              variant="ghost"
              theme={theme}
              onPress={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </View>
        </Screen>
      </RoleGuard>
    );
  }

  // ── Sales list ──────────────────────────────────────────────────────
  return (
    <RoleGuard allowed={SCREEN_ROLES.sales}>
      <Screen theme={theme}>
        <Card theme={theme} className="gap-3.5 p-6 rounded-[28px]">
          <Text variant="tag" theme={theme} className={accentClass}>
            Sales
          </Text>
          <Text variant="heading" theme={theme}>
            Revenue log
          </Text>
          <Button theme={theme} onPress={() => setShowForm(true)}>
            + New sale
          </Button>
        </Card>

        {sales.isLoading && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              Loading sales…
            </Text>
          </Card>
        )}

        {sales.isError && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={accentClass}>
              Could not load sales. The API may be offline or no farm exists yet.
            </Text>
          </Card>
        )}

        {sales.data?.length === 0 && (
          <Card variant="subtle" theme={theme}>
            <Text variant="detail" theme={theme} className={subtextClass}>
              No sales yet. Tap "+ New sale" to add one.
            </Text>
          </Card>
        )}

        {sales.data?.map((sale) => (
          <Card key={sale.id} variant="subtle" theme={theme}>
            <View className="flex-row justify-between items-center">
              <Text variant="label" theme={theme} className="capitalize">
                {sale.saleType}
              </Text>
              <Text variant="label" theme={theme} className={accentClass}>
                {formatNaira(sale.totalAmount)}
              </Text>
            </View>
            {sale.quantity != null && (
              <Text variant="detail" theme={theme} className={secondaryClass}>
                {sale.quantity} units
                {sale.unitPrice != null && ` × ${formatNaira(sale.unitPrice)}`}
              </Text>
            )}
            {sale.description && (
              <Text variant="detail" theme={theme} className={secondaryClass}>
                {sale.description}
              </Text>
            )}
            <Text variant="caption" theme={theme} className={subtextClass}>
              {new Date(sale.saleDate).toLocaleDateString("en-GB", {
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
