import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { dailyRecordRouter } from "./domain/dailyRecord";
import { expenseRouter } from "./domain/expense";
import { farmRouter } from "./domain/farm";
import { flockBatchRouter } from "./domain/flockBatch";
import { saleRouter } from "./domain/sale";

export const appRouter = createTRPCRouter({
  auth: createTRPCRouter({
    session: publicProcedure.query(() => {
      return {
        token: "farm-oss-demo-token",
        user: {
          id: "user-owner-001",
          userId: "100001",
          email: "manager@farmoss.app",
          name: "Farm Manager",
          role: "owner" as const,
          tenantId: "tenant-001",
        },
      };
    }),
    signIn: publicProcedure
      .input(
        z.object({
          userId: z.string().length(6, "User ID must be 6 digits"),
          password: z.string().min(4),
        }),
      )
      .mutation(({ input }) => {
        return {
          token: "farm-oss-demo-token",
          user: {
            id: "user-owner-001",
            userId: input.userId,
            email: "manager@farmoss.app",
            name: "Farm Manager",
            role: "owner" as const,
            tenantId: "tenant-001",
          },
        };
      }),
  }),
  dailyRecord: dailyRecordRouter,
  expense: expenseRouter,
  farm: farmRouter,
  flockBatch: flockBatchRouter,
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
  sale: saleRouter,
});

export type AppRouter = typeof appRouter;
