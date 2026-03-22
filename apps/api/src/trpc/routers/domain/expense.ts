import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../init";

export const expenseRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(30)
      })
    )
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.expense.findMany({
        where: {
          farmId: input.farmId,
          deletedAt: null,
          ...(input.flockBatchId && { flockBatchId: input.flockBatchId })
        },
        orderBy: { expenseDate: "desc" },
        take: input.limit
      });

      return expenses;
    }),

  create: publicProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        category: z.enum(["feed", "medication", "labor", "equipment", "other"]),
        description: z.string().optional(),
        amount: z.number().int().positive(),
        currency: z.string().length(3).default("NGN"),
        expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.create({
        data: {
          farmId: input.farmId,
          flockBatchId: input.flockBatchId,
          category: input.category,
          description: input.description,
          amount: input.amount,
          currency: input.currency,
          expenseDate: new Date(input.expenseDate)
        }
      });

      return expense;
    })
});
