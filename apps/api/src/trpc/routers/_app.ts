import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { cageProductionRouter } from "./domain/cageProduction";
import { cageUnitRouter } from "./domain/cageUnit";
import { dailyRecordRouter } from "./domain/dailyRecord";
import { expenseRouter } from "./domain/expense";
import { farmRouter } from "./domain/farm";
import { farmMemberRouter } from "./domain/farmMember";
import { flockBatchRouter } from "./domain/flockBatch";
import { pondBatchRouter } from "./domain/pondBatch";
import { pondRecordRouter } from "./domain/pondRecord";
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

  // ── Shared / cross-farm-type ─────────────────────────────────────────────
  farm: farmRouter,
  farmMember: farmMemberRouter,
  expense: expenseRouter,
  sale: saleRouter,

  // ── Poultry domain ───────────────────────────────────────────────────────
  flockBatch: flockBatchRouter,
  dailyRecord: dailyRecordRouter,
  cageUnit: cageUnitRouter,
  cageProduction: cageProductionRouter,

  // ── Fish pond domain ─────────────────────────────────────────────────────
  pondBatch: pondBatchRouter,
  pondRecord: pondRecordRouter,

  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
});

export type AppRouter = typeof appRouter;
