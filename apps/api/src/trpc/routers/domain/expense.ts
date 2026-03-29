import { z } from "zod";
import {
  assertFarmAccess,
  createTRPCRouter,
  managerProcedure,
  protectedProcedure,
} from "../../init";

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        pondBatchId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertFarmAccess(ctx, input.farmId);

      const expenses = await ctx.db.expense.findMany({
        where: {
          farmId: input.farmId,
          deletedAt: null,
          ...(input.flockBatchId && { flockBatchId: input.flockBatchId }),
          ...(input.pondBatchId && { pondBatchId: input.pondBatchId }),
        },
        orderBy: { expenseDate: "desc" },
        take: input.limit,
      });

      return expenses;
    }),

  create: managerProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        flockBatchId: z.string().uuid().optional(),
        pondBatchId: z.string().uuid().optional(),
        category: z.enum(["feed", "medication", "labor", "equipment", "other"]),
        description: z.string().optional(),
        amount: z.number().int().positive(),
        currency: z.string().length(3).default("NGN"),
        expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.create({
        data: {
          farmId: input.farmId,
          flockBatchId: input.flockBatchId,
          pondBatchId: input.pondBatchId,
          category: input.category,
          description: input.description,
          amount: input.amount,
          currency: input.currency,
          expenseDate: new Date(input.expenseDate),
        },
      });

      return expense;
    }),
});
