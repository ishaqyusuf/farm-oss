import { z } from "zod";
import {
  assertFarmAccess,
  createTRPCRouter,
  managerProcedure,
  ownerProcedure,
  protectedProcedure,
} from "../../init";

export const farmMemberRouter = createTRPCRouter({
  /**
   * List all workers assigned to a farm.
   * Owners and managers can see all. Workers can see their own farm's members.
   */
  list: protectedProcedure
    .input(z.object({ farmId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await assertFarmAccess(ctx, input.farmId);

      const members = await ctx.db.farmMember.findMany({
        where: { farmId: input.farmId },
        include: {
          user: {
            select: { id: true, userId: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return members;
    }),

  /**
   * Assign a worker to a farm.
   * Only managers and owners can assign farm members.
   */
  assign: managerProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["worker"]).default("worker"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the target user belongs to the same tenant
      const targetUser = await ctx.db.user.findFirst({
        where: { id: input.userId, tenantId: ctx.user.tenantId },
      });
      if (!targetUser) {
        throw new Error("User not found in this tenant");
      }

      const member = await ctx.db.farmMember.upsert({
        where: { farmId_userId: { farmId: input.farmId, userId: input.userId } },
        create: {
          farmId: input.farmId,
          userId: input.userId,
          role: input.role,
        },
        update: { role: input.role },
        include: {
          user: {
            select: { id: true, userId: true, name: true, email: true },
          },
        },
      });

      return member;
    }),

  /**
   * Remove a worker from a farm.
   * Only owners can remove farm members.
   */
  remove: ownerProcedure
    .input(
      z.object({
        farmId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.farmMember.delete({
        where: { farmId_userId: { farmId: input.farmId, userId: input.userId } },
      });

      return { success: true };
    }),

  /**
   * List all farms a specific user is assigned to.
   * Users can check their own assignments; managers/owners can check any user.
   */
  listByUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Workers can only query their own assignments
      if (ctx.user.role === "worker" && ctx.user.id !== input.userId) {
        throw new Error("Cannot view another user's farm assignments");
      }

      const memberships = await ctx.db.farmMember.findMany({
        where: { userId: input.userId },
        include: {
          farm: {
            select: { id: true, name: true, farmType: true, location: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return memberships;
    }),
});
