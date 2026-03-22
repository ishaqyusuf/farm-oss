import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../init";

export const farmRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const farms = await ctx.db.farm.findMany({
        where: { tenantId: input.tenantId, deletedAt: null },
        orderBy: { name: "asc" },
      });

      return farms;
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const farm = await ctx.db.farm.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          flockBatches: {
            where: { deletedAt: null, status: "active" },
            orderBy: { startDate: "desc" },
          },
        },
      });

      return farm;
    }),

  create: publicProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        name: z.string().min(1),
        location: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const farm = await ctx.db.farm.create({
        data: {
          tenantId: input.tenantId,
          name: input.name,
          location: input.location,
        },
      });

      return farm;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        location: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const farm = await ctx.db.farm.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.location !== undefined && { location: input.location }),
        },
      });

      return farm;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.farm.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
