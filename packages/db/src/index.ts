import { PrismaClient } from "../generated/prisma";

export const db = new PrismaClient();

export { PrismaClient };
export type * from "../generated/prisma";

