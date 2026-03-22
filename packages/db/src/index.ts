export type FlockType = "layers" | "broilers";

export type DailyRecordInput = {
  batchId: string;
  date: string;
  feedQuantityKg: number;
  eggCount?: number;
  mortalityCount: number;
  notes?: string;
};

