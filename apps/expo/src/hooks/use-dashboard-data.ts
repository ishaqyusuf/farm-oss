import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useDashboardData() {
  const trpc = useTRPC();

  const summary = useQuery(trpc.farm.dailySummary.queryOptions({}));
  const flocks = useQuery(trpc.farm.listFlocks.queryOptions());

  return {
    flocks,
    summary
  };
}

