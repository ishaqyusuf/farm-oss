import { z } from "zod";
import {
  assertFarmAccess,
  createTRPCRouter,
  managerProcedure,
  ownerProcedure,
  protectedProcedure,
  publicProcedure,
} from "../../init";

export const farmRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        farmType: z.enum(["poultry", "fish"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isWorker = ctx.user.role === "worker";

      const farms = await ctx.db.farm.findMany({
        where: {
          tenantId: input.tenantId,
          deletedAt: null,
          ...(input.farmType && { farmType: input.farmType }),
          // Workers only see farms they are assigned to
          ...(isWorker && {
            members: { some: { userId: ctx.user.id } },
          }),
        },
        orderBy: { name: "asc" },
      });

      return farms;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const farm = await ctx.db.farm.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          flockBatches: {
            where: { deletedAt: null, status: "active" },
            orderBy: { startDate: "desc" },
          },
          pondBatches: {
            where: { deletedAt: null, status: "active" },
            orderBy: { startDate: "desc" },
          },
        },
      });

      if (farm) {
        await assertFarmAccess(ctx, farm.id);
      }

      return farm;
    }),

  create: managerProcedure
    .input(
      z.object({
        tenantId: z.string().uuid(),
        name: z.string().min(1),
        farmType: z.enum(["poultry", "fish"]).default("poultry"),
        location: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const farm = await ctx.db.farm.create({
        data: {
          tenantId: input.tenantId,
          name: input.name,
          farmType: input.farmType,
          location: input.location,
        },
      });

      return farm;
    }),

  update: managerProcedure
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

  delete: ownerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.farm.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  /** Health check — no auth required */
  health: publicProcedure.query(() => ({ status: "ok" })),
});
