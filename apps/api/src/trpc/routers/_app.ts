import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { signToken, verifyPassword } from "../../lib/auth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
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
    /**
     * Sign in with a 6-digit userId and password.
     * Returns a signed JWT and the user object.
     */
    signIn: publicProcedure
      .input(
        z.object({
          userId: z.string().length(6, "User ID must be 6 digits"),
          password: z.string().min(4),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const dbUser = await ctx.db.user.findUnique({
          where: { userId: input.userId },
        });

        if (!dbUser) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid user ID or password",
          });
        }

        const valid = await verifyPassword(input.password, dbUser.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid user ID or password",
          });
        }

        const user = {
          id: dbUser.id,
          userId: dbUser.userId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as "owner" | "manager" | "worker",
          tenantId: dbUser.tenantId,
        };

        const token = await signToken(user);
        return { token, user };
      }),

    /**
     * Return the current session from the verified JWT in context.
     * Call this to validate a stored token is still live.
     */
    session: protectedProcedure.query(async ({ ctx }) => {
      // Re-fetch from DB so the client always gets fresh role/name data
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { id: true, userId: true, email: true, name: true, role: true, tenantId: true },
      });

      if (!dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
      }

      return {
        user: {
          id: dbUser.id,
          userId: dbUser.userId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as "owner" | "manager" | "worker",
          tenantId: dbUser.tenantId,
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
