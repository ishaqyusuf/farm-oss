import { useQuery } from "@tanstack/react-query";
import { PLACEHOLDER_FARM_ID } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";

/**
 * Fetches dashboard-level data.
 *
 * Queries:
 * - `health` — API connectivity check
 * - `dailyRecord.summary` — today's aggregated flock metrics
 * - `flockBatch.list` — active flock batches
 */
export function useDashboardData() {
  const trpc = useTRPC();

  const health = useQuery(trpc.health.queryOptions());

  const summary = useQuery(
    trpc.dailyRecord.summary.queryOptions({
      farmId: PLACEHOLDER_FARM_ID,
    }),
  );

  const batches = useQuery(
    trpc.flockBatch.list.queryOptions({
      farmId: PLACEHOLDER_FARM_ID,
      status: "active",
    }),
  );

  return {
    health,
    summary,
    batches,
  };
}
