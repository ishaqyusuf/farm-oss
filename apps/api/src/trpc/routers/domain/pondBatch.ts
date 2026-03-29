import { z } from "zod";
import {
  assertFarmAccess,
  createTRPCRouter,
  managerProcedure,
  ownerProcedure,
  protectedProcedure,
} from "../../init";

export const pondBatchRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        status: z.enum(["active", "harvested", "closed"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertFarmAccess(ctx, input.farmId);

      const batches = await ctx.db.pondBatch.findMany({
        where: {
          farmId: input.farmId,
          deletedAt: null,
          ...(input.status && { status: input.status }),
        },
        orderBy: { startDate: "desc" },
      });

      return batches;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.pondBatch.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          farm: { select: { id: true, name: true } },
        },
      });

      if (batch) {
        await assertFarmAccess(ctx, batch.farmId);
      }

      return batch;
    }),

  create: managerProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        name: z.string().min(1),
        species: z.enum(["tilapia", "catfish", "salmon", "carp", "other"]),
        stockingCount: z.number().int().positive(),
        avgWeightG: z.number().int().positive().optional(),
        waterType: z.enum(["fresh", "brackish", "salt"]).optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.pondBatch.create({
        data: {
          farmId: input.farmId,
          name: input.name,
          species: input.species,
          stockingCount: input.stockingCount,
          currentCount: input.stockingCount,
          avgWeightG: input.avgWeightG,
          waterType: input.waterType,
          startDate: new Date(input.startDate),
          status: "active",
        },
      });

      return batch;
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        avgWeightG: z.number().int().positive().optional(),
        waterType: z.enum(["fresh", "brackish", "salt"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const batch = await ctx.db.pondBatch.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.avgWeightG !== undefined && { avgWeightG: data.avgWeightG }),
          ...(data.waterType !== undefined && { waterType: data.waterType }),
        },
      });

      return batch;
    }),

  harvest: managerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.pondBatch.update({
        where: { id: input.id },
        data: {
          status: "harvested",
          endDate: new Date(input.endDate),
        },
      });

      return batch;
    }),

  delete: ownerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.pondBatch.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
