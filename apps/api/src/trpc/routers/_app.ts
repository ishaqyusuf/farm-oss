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
          email: "manager@farmoss.app",
          id: "user-owner-001",
          name: "Farm Manager",
          role: "owner" as const
        }
      };
    }),
    signIn: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(4)
        })
      )
      .mutation(({ input }) => {
        return {
          token: "farm-oss-demo-token",
          user: {
            email: input.email,
            id: "user-owner-001",
            name: "Farm Manager",
            role: "owner" as const
          }
        };
      })
  }),
  dailyRecord: dailyRecordRouter,
  expense: expenseRouter,
  farm: farmRouter,
  flockBatch: flockBatchRouter,
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }),
  sale: saleRouter
});

export type AppRouter = typeof appRouter;
