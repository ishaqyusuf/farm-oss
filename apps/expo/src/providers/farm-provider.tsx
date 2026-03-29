import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTRPC } from "@/trpc/client";

type Farm = { id: string; name: string; farmType: string };
type FlockBatch = { id: string; name: string; currentCount: number };

type FarmContextValue = {
  farms: Farm[];
  batches: FlockBatch[];
  selectedFarm: Farm | null;
  selectedBatch: FlockBatch | null;
  setSelectedFarm: (farm: Farm) => void;
  setSelectedBatch: (batch: FlockBatch) => void;
  isLoading: boolean;
};

const FarmContext = createContext<FarmContextValue | null>(null);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const trpc = useTRPC();

  const [selectedFarm, setSelectedFarmState] = useState<Farm | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<FlockBatch | null>(null);

  const farmsQuery = useQuery({
    ...trpc.farm.list.queryOptions({ tenantId: session?.user.tenantId ?? "" }),
    enabled: !!session,
  });

  const batchesQuery = useQuery({
    ...trpc.flockBatch.list.queryOptions({
      farmId: selectedFarm?.id ?? "",
      status: "active",
    }),
    enabled: !!selectedFarm,
  });

  // Auto-select first farm when farms load
  useEffect(() => {
    if (farmsQuery.data && farmsQuery.data.length > 0 && !selectedFarm) {
      setSelectedFarmState(farmsQuery.data[0] as Farm);
    }
  }, [farmsQuery.data, selectedFarm]);

  // Auto-select first active batch when batches load or farm changes
  useEffect(() => {
    if (batchesQuery.data && batchesQuery.data.length > 0) {
      setSelectedBatch(batchesQuery.data[0] as FlockBatch);
    } else if (batchesQuery.data && batchesQuery.data.length === 0) {
      setSelectedBatch(null);
    }
  }, [batchesQuery.data]);

  function setSelectedFarm(farm: Farm) {
    setSelectedFarmState(farm);
    setSelectedBatch(null); // reset batch when farm changes
  }

  const value: FarmContextValue = {
    farms: (farmsQuery.data ?? []) as Farm[],
    batches: (batchesQuery.data ?? []) as FlockBatch[],
    selectedFarm,
    selectedBatch,
    setSelectedFarm,
    setSelectedBatch,
    isLoading: farmsQuery.isLoading,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error("useFarm must be used within FarmProvider");
  }
  return context;
}
