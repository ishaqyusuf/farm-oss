import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

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
  farm: createTRPCRouter({
    dailySummary: publicProcedure
      .input(
        z.object({
          date: z.string().optional()
        })
      )
      .query(({ input }) => {
        return {
          date: input.date ?? new Date().toISOString().slice(0, 10),
          eggCount: 842,
          feedQuantityKg: 125,
          mortalityCount: 3
        };
      }),
    listFlocks: publicProcedure.query(() => {
      return [
        {
          ageInDays: 84,
          birdCount: 1000,
          id: "batch-layers-jan",
          startedAt: "2026-01-01",
          type: "layers"
        }
      ];
    })
  }),
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  })
});

export type AppRouter = typeof appRouter;
