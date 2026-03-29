import type { AuthUser } from "@farm-oss/auth";
import { db } from "@farm-oss/db";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../lib/auth";

export async function createTRPCContext(opts: { req: Request }) {
  const authorization = opts.req.headers.get("Authorization");
  const token =
    authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  let user: AuthUser | null = null;
  if (token) {
    user = await verifyToken(token);
  }

  return {
    db,
    now: new Date(),
    user,
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const trpc = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = trpc.router;

/** No authentication required */
export const publicProcedure = trpc.procedure;

/** Any authenticated user (owner, manager, or worker) */
export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/** Manager or owner only — workers cannot mutate shared tenant-wide resources */
export const managerProcedure = trpc.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  if (ctx.user.role === "worker") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Manager or owner role required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/** Owner only — full administrative access */
export const ownerProcedure = trpc.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  if (ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Owner role required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * Assert that the current user can access the given farm.
 * - owner / manager: tenant-wide access, always allowed.
 * - worker: must have an explicit FarmMember entry for this farm.
 */
export async function assertFarmAccess(
  ctx: Context & { user: AuthUser },
  farmId: string,
): Promise<void> {
  if (ctx.user.role === "owner" || ctx.user.role === "manager") {
    return;
  }
  const member = await ctx.db.farmMember.findUnique({
    where: { farmId_userId: { farmId, userId: ctx.user.id } },
  });
  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not assigned to this farm",
    });
  }
}
