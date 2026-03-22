import { Hono } from "hono";
import { z } from "zod";
import type { ApiContext } from "./types";

const flockBatchSchema = z.object({
  ageInDays: z.number(),
  birdCount: z.number(),
  id: z.string(),
  startedAt: z.string(),
  type: z.enum(["broilers", "layers"])
});

const dailyRecordSchema = z.object({
  batchId: z.string(),
  date: z.string(),
  eggCount: z.number().optional(),
  feedQuantityKg: z.number(),
  mortalityCount: z.number()
});

export const farmRouter = new Hono<ApiContext>();

farmRouter.post("/auth/sign-in", async (context) => {
  const body = await context.req.json();
  const email =
    typeof body?.email === "string" && body.email.length > 0
      ? body.email
      : "manager@farmoss.app";

  return context.json({
    session: {
      token: "farm-oss-demo-token",
      user: {
        email,
        id: "user-owner-001",
        name: "Farm Manager",
        role: "owner"
      }
    }
  });
});

farmRouter.get("/auth/session", (context) => {
  return context.json({
    session: {
      token: "farm-oss-demo-token",
      user: {
        email: "manager@farmoss.app",
        id: "user-owner-001",
        name: "Farm Manager",
        role: "owner"
      }
    }
  });
});

farmRouter.get("/farms", (context) => {
  return context.json({
    farms: [
      {
        id: "farm-001",
        location: "Ibadan, Nigeria",
        name: "Green Pastures Farm"
      }
    ]
  });
});

farmRouter.get("/flock-batches", (context) => {
  const flocks = [
    {
      ageInDays: 84,
      birdCount: 1000,
      id: "batch-layers-jan",
      startedAt: "2026-01-01",
      type: "layers"
    }
  ];

  return context.json({
    flocks: z.array(flockBatchSchema).parse(flocks)
  });
});

farmRouter.get("/daily-records", (context) => {
  const records = [
    {
      batchId: "batch-layers-jan",
      date: "2026-03-22",
      eggCount: 842,
      feedQuantityKg: 125,
      mortalityCount: 3
    }
  ];

  return context.json({
    records: z.array(dailyRecordSchema).parse(records)
  });
});
