import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../init";

export const dailyRecordRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        flockBatchId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const records = await ctx.db.dailyRecord.findMany({
        where: { flockBatchId: input.flockBatchId },
        orderBy: { recordDate: "desc" },
        take: input.limit,
      });

      return records;
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.dailyRecord.findUnique({
        where: { id: input.id },
        include: {
          flockBatch: { select: { id: true, name: true, birdType: true } },
          recorder: { select: { id: true, name: true } },
        },
      });

      return record;
    }),

  create: publicProcedure
    .input(
      z.object({
        flockBatchId: z.string().uuid(),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        eggCount: z.number().int().min(0).optional(),
        feedGrams: z.number().int().min(0).optional(),
        mortality: z.number().int().min(0).default(0),
        mortalityNotes: z.string().optional(),
        notes: z.string().optional(),
        recordedBy: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.$transaction(async (tx) => {
        const created = await tx.dailyRecord.create({
          data: {
            flockBatchId: input.flockBatchId,
            recordDate: new Date(input.recordDate),
            eggCount: input.eggCount,
            feedGrams: input.feedGrams,
            mortality: input.mortality,
            mortalityNotes: input.mortalityNotes,
            notes: input.notes,
            recordedBy: input.recordedBy,
          },
        });

        if (input.mortality > 0) {
          await tx.flockBatch.update({
            where: { id: input.flockBatchId },
            data: { currentCount: { decrement: input.mortality } },
          });
        }

        return created;
      });

      return record;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        eggCount: z.number().int().min(0).optional(),
        feedGrams: z.number().int().min(0).optional(),
        mortality: z.number().int().min(0).optional(),
        mortalityNotes: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.dailyRecord.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error("Record not found");
      }

      const record = await ctx.db.$transaction(async (tx) => {
        const updated = await tx.dailyRecord.update({
          where: { id },
          data: {
            ...(data.eggCount !== undefined && { eggCount: data.eggCount }),
            ...(data.feedGrams !== undefined && { feedGrams: data.feedGrams }),
            ...(data.mortality !== undefined && { mortality: data.mortality }),
            ...(data.mortalityNotes !== undefined && {
              mortalityNotes: data.mortalityNotes,
            }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
        });

        if (
          data.mortality !== undefined &&
          data.mortality !== existing.mortality
        ) {
          const diff = data.mortality - existing.mortality;
          if (diff > 0) {
            await tx.flockBatch.update({
              where: { id: existing.flockBatchId },
              data: { currentCount: { decrement: diff } },
            });
          } else {
            await tx.flockBatch.update({
              where: { id: existing.flockBatchId },
              data: { currentCount: { increment: Math.abs(diff) } },
            });
          }
        }

        return updated;
      });

      return record;
    }),

  summary: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const targetDate = input.date ?? new Date().toISOString().slice(0, 10);

      const records = await ctx.db.dailyRecord.findMany({
        where: {
          recordDate: new Date(targetDate),
          flockBatch: { farmId: input.farmId, deletedAt: null },
        },
        include: {
          flockBatch: { select: { id: true, name: true, birdType: true } },
        },
      });

      const eggCount = records.reduce((sum, r) => sum + (r.eggCount ?? 0), 0);
      const feedGrams = records.reduce((sum, r) => sum + (r.feedGrams ?? 0), 0);
      const mortality = records.reduce((sum, r) => sum + r.mortality, 0);

      return {
        date: targetDate,
        eggCount,
        feedGrams,
        mortality,
        recordCount: records.length,
        records,
      };
    }),
});
