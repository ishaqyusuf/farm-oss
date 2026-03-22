import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../init";

export const cageProductionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cageUnitId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const records = await ctx.db.cageProduction.findMany({
        where: { cageUnitId: input.cageUnitId },
        orderBy: { recordDate: "desc" },
        take: input.limit,
        include: {
          cageUnit: { select: { id: true, label: true, birdCount: true } },
        },
      });

      return records;
    }),

  create: publicProcedure
    .input(
      z.object({
        cageUnitId: z.string().uuid(),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        eggCount: z.number().int().min(0).default(0),
        feedGrams: z.number().int().min(0).optional(),
        waterMl: z.number().int().min(0).optional(),
        mortality: z.number().int().min(0).default(0),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.$transaction(async (tx) => {
        const created = await tx.cageProduction.create({
          data: {
            cageUnitId: input.cageUnitId,
            recordDate: new Date(input.recordDate),
            eggCount: input.eggCount,
            feedGrams: input.feedGrams,
            waterMl: input.waterMl,
            mortality: input.mortality,
            notes: input.notes,
          },
        });

        if (input.mortality > 0) {
          await tx.cageUnit.update({
            where: { id: input.cageUnitId },
            data: { birdCount: { decrement: input.mortality } },
          });
        }

        return created;
      });

      return record;
    }),

  summary: publicProcedure
    .input(
      z.object({
        flockBatchId: z.string().uuid(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const targetDate = input.date ?? new Date().toISOString().slice(0, 10);

      const cageUnits = await ctx.db.cageUnit.findMany({
        where: {
          flockBatchId: input.flockBatchId,
          deletedAt: null,
        },
        select: { id: true, label: true, birdCount: true, startDate: true },
      });

      const records = await ctx.db.cageProduction.findMany({
        where: {
          recordDate: new Date(targetDate),
          cageUnit: {
            flockBatchId: input.flockBatchId,
            deletedAt: null,
          },
        },
        include: {
          cageUnit: { select: { id: true, label: true, birdCount: true } },
        },
      });

      const totalEggs = records.reduce((sum, r) => sum + r.eggCount, 0);
      const totalFeedGrams = records.reduce(
        (sum, r) => sum + (r.feedGrams ?? 0),
        0,
      );
      const totalWaterMl = records.reduce(
        (sum, r) => sum + (r.waterMl ?? 0),
        0,
      );
      const totalMortality = records.reduce((sum, r) => sum + r.mortality, 0);
      const totalBirds = cageUnits.reduce((sum, u) => sum + u.birdCount, 0);

      return {
        date: targetDate,
        totalEggs,
        totalFeedGrams,
        totalWaterMl,
        totalMortality,
        totalBirds,
        totalCages: cageUnits.length,
        recordCount: records.length,
        records,
      };
    }),
});
