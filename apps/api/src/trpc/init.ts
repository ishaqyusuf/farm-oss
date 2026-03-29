import type { AuthUser } from "@farm-oss/auth";
import { db } from "@farm-oss/db";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

export async function createTRPCContext(opts: { req: Request }) {
  const authorization = opts.req.headers.get("Authorization");
  const token =
    authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  // Demo token — replace with real JWT validation once auth is live
  let user: AuthUser | null = null;
  if (token && token !== "") {
    if (token === "farm-oss-demo-token") {
      user = {
        id: "user-owner-001",
        userId: "100001",
        email: "manager@farmoss.app",
        name: "Farm Manager",
        role: "owner",
        tenantId: "tenant-001",
      };
    } else {
      // Look up real user by token from DB when real auth is implemented
      const dbUser = await db.user.findFirst({
        where: { id: token },
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
        },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          userId: dbUser.userId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as AuthUser["role"],
          tenantId: dbUser.tenantId,
        };
      }
    }
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
 *
 * Call this inside any resolver that operates on farm-scoped data.
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
