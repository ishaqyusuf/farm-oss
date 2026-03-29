import { z } from "zod";
import { createTRPCRouter, managerProcedure, publicProcedure } from "../../init";

export const flockBatchRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        status: z.enum(["active", "closed"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const batches = await ctx.db.flockBatch.findMany({
        where: {
          farmId: input.farmId,
          deletedAt: null,
          ...(input.status && { status: input.status }),
        },
        orderBy: { startDate: "desc" },
      });

      return batches;
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const batch = await ctx.db.flockBatch.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          farm: { select: { id: true, name: true } },
        },
      });

      return batch;
    }),

  create: managerProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        name: z.string().min(1),
        birdType: z.enum(["layer", "broiler"]),
        initialCount: z.number().int().positive(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.flockBatch.create({
        data: {
          farmId: input.farmId,
          name: input.name,
          birdType: input.birdType,
          initialCount: input.initialCount,
          currentCount: input.initialCount,
          startDate: new Date(input.startDate),
          status: "active",
        },
      });

      return batch;
    }),

  close: managerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.flockBatch.update({
        where: { id: input.id },
        data: {
          status: "closed",
          endDate: new Date(input.endDate),
        },
      });

      return batch;
    }),
});
