import { z } from "zod";
import {
  createTRPCRouter,
  managerProcedure,
  ownerProcedure,
  publicProcedure,
} from "../../init";

export const cageUnitRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        flockBatchId: z.string().uuid(),
        status: z.enum(["active", "inactive"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const units = await ctx.db.cageUnit.findMany({
        where: {
          flockBatchId: input.flockBatchId,
          deletedAt: null,
          ...(input.status && { status: input.status }),
        },
        orderBy: { label: "asc" },
      });

      return units;
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const unit = await ctx.db.cageUnit.findFirst({
        where: { id: input.id, deletedAt: null },
        include: {
          flockBatch: { select: { id: true, name: true, birdType: true } },
        },
      });

      return unit;
    }),

  create: managerProcedure
    .input(
      z.object({
        flockBatchId: z.string().uuid(),
        label: z.string().min(1),
        birdCount: z.number().int().min(0),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const unit = await ctx.db.cageUnit.create({
        data: {
          flockBatchId: input.flockBatchId,
          label: input.label,
          birdCount: input.birdCount,
          startDate: new Date(input.startDate),
          status: "active",
          notes: input.notes,
        },
      });

      return unit;
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        label: z.string().min(1).optional(),
        birdCount: z.number().int().min(0).optional(),
        status: z.enum(["active", "inactive"]).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const unit = await ctx.db.cageUnit.update({
        where: { id },
        data: {
          ...(data.label !== undefined && { label: data.label }),
          ...(data.birdCount !== undefined && { birdCount: data.birdCount }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return unit;
    }),

  delete: ownerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cageUnit.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
