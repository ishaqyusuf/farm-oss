import NetInfo from "@react-native-community/netinfo";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type OfflineAction,
  dequeue,
  getQueue,
  markRetried,
} from "@/lib/offline-queue";
import { useTRPC } from "@/trpc/client";

type SyncStatus = "idle" | "syncing" | "offline";

type SyncContextValue = {
  /** Current connectivity / sync state. */
  status: SyncStatus;
  /** Whether the device is connected to the network. */
  isOnline: boolean;
  /** Number of actions waiting in the offline queue. */
  pendingCount: number;
  /** Manually trigger a sync attempt. */
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue>({
  status: "idle",
  isOnline: true,
  pendingCount: 0,
  syncNow: async () => {},
});

/** Max retries before an action is dropped. */
const MAX_RETRIES = 5;

export function SyncProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const trpc = useTRPC();
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const syncingRef = useRef(false);

  // Refresh the pending count from storage.
  const refreshCount = useCallback(async () => {
    const queue = await getQueue();
    setPendingCount(queue.length);
  }, []);

  // Process one queued action via tRPC.
  const processAction = useCallback(
    async (action: OfflineAction): Promise<boolean> => {
      try {
        const [routerName, procedureName] = action.procedure.split(".") as [
          string,
          string,
        ];
        // biome-ignore lint/suspicious/noExplicitAny: dynamic tRPC dispatch
        const router = (trpc as any)[routerName];
        if (!router) return false;
        const procedure = router[procedureName];
        if (!procedure?.mutate) return false;

        await procedure.mutate(action.input);
        await dequeue(action.id);
        return true;
      } catch {
        await markRetried(action.id);
        return false;
      }
    },
    [trpc],
  );

  // Attempt to flush the entire queue.
  const syncNow = useCallback(async () => {
    if (syncingRef.current || !isOnline) return;
    syncingRef.current = true;
    setStatus("syncing");

    const queue = await getQueue();
    for (const action of queue) {
      if (action.retries >= MAX_RETRIES) {
        await dequeue(action.id);
        continue;
      }
      const ok = await processAction(action);
      if (!ok) break; // stop on first failure (network may have dropped)
    }

    await refreshCount();
    syncingRef.current = false;
    setStatus(isOnline ? "idle" : "offline");
  }, [isOnline, processAction, refreshCount]);

  // Monitor network state.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      setIsOnline(online);
      setStatus(online ? "idle" : "offline");

      // Auto-sync when coming back online
      if (online) {
        syncNow();
      }
    });

    // Initial check
    refreshCount();

    return () => {
      unsubscribe();
    };
  }, [syncNow, refreshCount]);

  return (
    <SyncContext.Provider
      value={{ status, isOnline, pendingCount, syncNow }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
