import { db } from "@farm-oss/db";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export async function createTRPCContext() {
  return {
    db,
    now: new Date(),
  };
}

const trpc = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  });

export const createTRPCRouter = trpc.router;
export const publicProcedure = trpc.procedure;
