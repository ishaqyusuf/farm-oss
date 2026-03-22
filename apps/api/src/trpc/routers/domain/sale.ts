import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../init";

export const saleRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sales = await ctx.db.sale.findMany({
        where: {
          farmId: input.farmId,
          deletedAt: null,
          ...(input.flockBatchId && { flockBatchId: input.flockBatchId }),
        },
        orderBy: { saleDate: "desc" },
        take: input.limit,
      });

      return sales;
    }),

  create: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        saleType: z.enum(["eggs", "birds", "other"]),
        description: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        unitPrice: z.number().int().positive().optional(),
        totalAmount: z.number().int().positive(),
        currency: z.string().length(3).default("NGN"),
        saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.create({
        data: {
          farmId: input.farmId,
          flockBatchId: input.flockBatchId,
          saleType: input.saleType,
          description: input.description,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          totalAmount: input.totalAmount,
          currency: input.currency,
          saleDate: new Date(input.saleDate),
        },
      });

      return sale;
    }),
});
