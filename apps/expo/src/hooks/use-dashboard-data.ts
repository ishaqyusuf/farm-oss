import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/**
 * Fetches dashboard-level data.
 *
 * Currently uses the health endpoint as a connectivity check.
 * Once auth resolves a farmId, this will query `dailyRecord.summary`
 * and `flockBatch.list` for real farm data.
 */
export function useDashboardData() {
  const trpc = useTRPC();

  const summary = useQuery(trpc.health.queryOptions());

  return {
    summary,
  };
}
