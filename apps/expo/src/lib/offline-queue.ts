import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "farm_oss_offline_queue";

export type OfflineAction = {
  id: string;
  /** tRPC procedure path, e.g. "dailyRecord.create" */
  procedure: string;
  /** Serialised input payload */
  input: unknown;
  /** ISO timestamp when the action was queued */
  createdAt: string;
  /** Number of times sync has been attempted */
  retries: number;
};

/** Generate a simple unique id for queue entries. */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Read the full queue from storage. */
export async function getQueue(): Promise<OfflineAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
}

/** Persist the queue to storage. */
async function saveQueue(queue: OfflineAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add a new action to the offline queue. */
export async function enqueue(
  procedure: string,
  input: unknown,
): Promise<OfflineAction> {
  const action: OfflineAction = {
    id: uid(),
    procedure,
    input,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  const queue = await getQueue();
  queue.push(action);
  await saveQueue(queue);
  return action;
}

/** Remove a successfully synced action by id. */
export async function dequeue(id: string): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.filter((a) => a.id !== id));
}

/** Mark an action as retried (increment counter). */
export async function markRetried(id: string): Promise<void> {
  const queue = await getQueue();
  const item = queue.find((a) => a.id === id);
  if (item) {
    item.retries += 1;
  }
  await saveQueue(queue);
}

/** Clear the entire queue (e.g. on sign-out). */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
