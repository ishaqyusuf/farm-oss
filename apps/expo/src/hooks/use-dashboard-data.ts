import { useQuery } from "@tanstack/react-query";
import { useFarm } from "@/providers/farm-provider";
import { useTRPC } from "@/trpc/client";

/**
 * Fetches dashboard-level data.
 *
 * Queries:
 * - `health` — API connectivity check
 * - `dailyRecord.summary` — today's aggregated flock metrics
 * - `flockBatch.list` — active flock batches
 * - `cageProduction.summary` — today's cage-level aggregated metrics
 */
export function useDashboardData() {
  const trpc = useTRPC();
  const { selectedFarm, selectedBatch } = useFarm();

  const health = useQuery(trpc.health.queryOptions());

  const summary = useQuery({
    ...trpc.dailyRecord.summary.queryOptions({
      farmId: selectedFarm?.id ?? "",
    }),
    enabled: !!selectedFarm,
  });

  const batches = useQuery({
    ...trpc.flockBatch.list.queryOptions({
      farmId: selectedFarm?.id ?? "",
      status: "active",
    }),
    enabled: !!selectedFarm,
  });

  const cageSummary = useQuery({
    ...trpc.cageProduction.summary.queryOptions({
      flockBatchId: selectedBatch?.id ?? "",
    }),
    enabled: !!selectedBatch,
  });

  return {
    health,
    summary,
    batches,
    cageSummary,
  };
}
