import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  assertFarmAccess,
  createTRPCRouter,
  managerProcedure,
  protectedProcedure,
} from "../../init";

export const pondRecordRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        pondBatchId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.pondBatch.findFirst({
        where: { id: input.pondBatchId, deletedAt: null },
        select: { farmId: true },
      });
      if (batch) {
        await assertFarmAccess(ctx, batch.farmId);
      }

      const records = await ctx.db.pondRecord.findMany({
        where: { pondBatchId: input.pondBatchId },
        orderBy: { recordDate: "desc" },
        take: input.limit,
      });

      return records;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.pondRecord.findUnique({
        where: { id: input.id },
        include: {
          pondBatch: { select: { id: true, name: true, species: true, farmId: true } },
          recorder: { select: { id: true, name: true } },
        },
      });

      if (record) {
        await assertFarmAccess(ctx, record.pondBatch.farmId);
      }

      return record;
    }),

  create: protectedProcedure
    .input(
      z.object({
        pondBatchId: z.string().uuid(),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        // Feed
        feedGrams: z.number().int().min(0).optional(),
        feedType: z.enum(["pellets", "live", "mixed", "other"]).optional(),
        // Water quality
        phLevel: z.number().min(0).max(14).optional(),
        dissolvedOxygenMgl: z.number().min(0).optional(),
        waterTempC: z.number().optional(),
        waterChangePercent: z.number().int().min(0).max(100).optional(),
        // Mortality
        mortality: z.number().int().min(0).default(0),
        mortalityNotes: z.string().optional(),
        // Partial harvest
        harvestCount: z.number().int().min(0).default(0),
        harvestWeightG: z.number().int().min(0).optional(),
        notes: z.string().optional(),
        recordedBy: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.pondBatch.findFirst({
        where: { id: input.pondBatchId, deletedAt: null },
        select: { farmId: true },
      });
      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pond batch not found" });
      }
      await assertFarmAccess(ctx, batch.farmId);

      const record = await ctx.db.$transaction(async (tx) => {
        const created = await tx.pondRecord.create({
          data: {
            pondBatchId: input.pondBatchId,
            recordDate: new Date(input.recordDate),
            feedGrams: input.feedGrams,
            feedType: input.feedType,
            phLevel: input.phLevel,
            dissolvedOxygenMgl: input.dissolvedOxygenMgl,
            waterTempC: input.waterTempC,
            waterChangePercent: input.waterChangePercent,
            mortality: input.mortality,
            mortalityNotes: input.mortalityNotes,
            harvestCount: input.harvestCount,
            harvestWeightG: input.harvestWeightG,
            notes: input.notes,
            recordedBy: input.recordedBy ?? ctx.user.id,
          },
        });

        const totalLoss = input.mortality + input.harvestCount;
        if (totalLoss > 0) {
          await tx.pondBatch.update({
            where: { id: input.pondBatchId },
            data: { currentCount: { decrement: totalLoss } },
          });
        }

        return created;
      });

      return record;
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        feedGrams: z.number().int().min(0).optional(),
        feedType: z.enum(["pellets", "live", "mixed", "other"]).optional(),
        phLevel: z.number().min(0).max(14).optional(),
        dissolvedOxygenMgl: z.number().min(0).optional(),
        waterTempC: z.number().optional(),
        waterChangePercent: z.number().int().min(0).max(100).optional(),
        mortality: z.number().int().min(0).optional(),
        mortalityNotes: z.string().optional(),
        harvestCount: z.number().int().min(0).optional(),
        harvestWeightG: z.number().int().min(0).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.pondRecord.findUnique({ where: { id } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }

      const record = await ctx.db.$transaction(async (tx) => {
        const updated = await tx.pondRecord.update({
          where: { id },
          data: {
            ...(data.feedGrams !== undefined && { feedGrams: data.feedGrams }),
            ...(data.feedType !== undefined && { feedType: data.feedType }),
            ...(data.phLevel !== undefined && { phLevel: data.phLevel }),
            ...(data.dissolvedOxygenMgl !== undefined && { dissolvedOxygenMgl: data.dissolvedOxygenMgl }),
            ...(data.waterTempC !== undefined && { waterTempC: data.waterTempC }),
            ...(data.waterChangePercent !== undefined && { waterChangePercent: data.waterChangePercent }),
            ...(data.mortality !== undefined && { mortality: data.mortality }),
            ...(data.mortalityNotes !== undefined && { mortalityNotes: data.mortalityNotes }),
            ...(data.harvestCount !== undefined && { harvestCount: data.harvestCount }),
            ...(data.harvestWeightG !== undefined && { harvestWeightG: data.harvestWeightG }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
        });

        // Reconcile currentCount if mortality or harvestCount changed
        const oldLoss = existing.mortality + existing.harvestCount;
        const newMortality = data.mortality ?? existing.mortality;
        const newHarvest = data.harvestCount ?? existing.harvestCount;
        const newLoss = newMortality + newHarvest;
        const diff = newLoss - oldLoss;

        if (diff !== 0) {
          await tx.pondBatch.update({
            where: { id: existing.pondBatchId },
            data: {
              currentCount:
                diff > 0
                  ? { decrement: diff }
                  : { increment: Math.abs(diff) },
            },
          });
        }

        return updated;
      });

      return record;
    }),

  summary: protectedProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertFarmAccess(ctx, input.farmId);

      const targetDate = input.date ?? new Date().toISOString().slice(0, 10);

      const records = await ctx.db.pondRecord.findMany({
        where: {
          recordDate: new Date(targetDate),
          pondBatch: { farmId: input.farmId, deletedAt: null },
        },
        include: {
          pondBatch: { select: { id: true, name: true, species: true } },
        },
      });

      const totalFeedGrams = records.reduce((s, r) => s + (r.feedGrams ?? 0), 0);
      const totalMortality = records.reduce((s, r) => s + r.mortality, 0);
      const totalHarvestCount = records.reduce((s, r) => s + r.harvestCount, 0);
      const totalHarvestWeightG = records.reduce((s, r) => s + (r.harvestWeightG ?? 0), 0);

      return {
        date: targetDate,
        totalFeedGrams,
        totalMortality,
        totalHarvestCount,
        totalHarvestWeightG,
        recordCount: records.length,
        records,
      };
    }),
});
