import { db } from "@farm-oss/db";
import { Hono } from "hono";
import { z } from "zod";
import type { ApiContext } from "./types";

export const farmRouter = new Hono<ApiContext>();

// ── Validation Schemas ─────────────────────────────────────────────────

const createFarmSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  location: z.string().optional(),
});

const createFlockBatchSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(1),
  birdType: z.enum(["layer", "broiler"]),
  initialCount: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createDailyRecordSchema = z.object({
  flockBatchId: z.string().uuid(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eggCount: z.number().int().min(0).optional(),
  feedGrams: z.number().int().min(0).optional(),
  mortality: z.number().int().min(0).default(0),
  mortalityNotes: z.string().optional(),
  notes: z.string().optional(),
  recordedBy: z.string().uuid().optional(),
});

const createExpenseSchema = z.object({
  farmId: z.string().uuid(),
  flockBatchId: z.string().uuid().optional(),
  category: z.enum(["feed", "medication", "labor", "equipment", "other"]),
  description: z.string().optional(),
  amount: z.number().int().positive(),
  currency: z.string().length(3).default("NGN"),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createSaleSchema = z.object({
  farmId: z.string().uuid(),
  flockBatchId: z.string().uuid().optional(),
  saleType: z.enum(["eggs", "birds", "other"]),
  description: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().int().positive().optional(),
  totalAmount: z.number().int().positive(),
  currency: z.string().length(3).default("NGN"),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ── Auth (still demo) ──────────────────────────────────────────────────

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
        role: "owner",
      },
    },
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
        role: "owner",
      },
    },
  });
});

// ── Farms ──────────────────────────────────────────────────────────────

farmRouter.get("/farms", async (context) => {
  const tenantId = context.req.query("tenantId");

  const farms = await db.farm.findMany({
    where: {
      deletedAt: null,
      ...(tenantId && { tenantId }),
    },
    orderBy: { name: "asc" },
  });

  return context.json({ farms });
});

farmRouter.post("/farms", async (context) => {
  const parsed = createFarmSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const farm = await db.farm.create({
    data: {
      tenantId: parsed.data.tenantId,
      name: parsed.data.name,
      location: parsed.data.location,
    },
  });

  return context.json({ farm }, 201);
});

farmRouter.get("/farms/:id", async (context) => {
  const id = context.req.param("id");

  const farm = await db.farm.findFirst({
    where: { id, deletedAt: null },
    include: {
      flockBatches: {
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!farm) {
    return context.json({ error: "Farm not found" }, 404);
  }

  return context.json({ farm });
});

// ── Flock Batches ──────────────────────────────────────────────────────

farmRouter.get("/flock-batches", async (context) => {
  const farmId = context.req.query("farmId");

  const batches = await db.flockBatch.findMany({
    where: {
      deletedAt: null,
      ...(farmId && { farmId }),
    },
    orderBy: { startDate: "desc" },
  });

  return context.json({ flockBatches: batches });
});

farmRouter.post("/flock-batches", async (context) => {
  const parsed = createFlockBatchSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const batch = await db.flockBatch.create({
    data: {
      farmId: parsed.data.farmId,
      name: parsed.data.name,
      birdType: parsed.data.birdType,
      initialCount: parsed.data.initialCount,
      currentCount: parsed.data.initialCount,
      startDate: new Date(parsed.data.startDate),
      status: "active",
    },
  });

  return context.json({ flockBatch: batch }, 201);
});

farmRouter.get("/flock-batches/:id", async (context) => {
  const id = context.req.param("id");

  const batch = await db.flockBatch.findFirst({
    where: { id, deletedAt: null },
    include: {
      farm: { select: { id: true, name: true } },
    },
  });

  if (!batch) {
    return context.json({ error: "Flock batch not found" }, 404);
  }

  return context.json({ flockBatch: batch });
});

// ── Daily Records ──────────────────────────────────────────────────────

farmRouter.get("/daily-records", async (context) => {
  const flockBatchId = context.req.query("flockBatchId");
  const limit = Number(context.req.query("limit") ?? "30");

  const records = await db.dailyRecord.findMany({
    where: {
      ...(flockBatchId && { flockBatchId }),
    },
    orderBy: { recordDate: "desc" },
    take: Math.min(limit, 100),
  });

  return context.json({ dailyRecords: records });
});

farmRouter.post("/daily-records", async (context) => {
  const parsed = createDailyRecordSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const input = parsed.data;
  const record = await db.$transaction(async (tx) => {
    const created = await tx.dailyRecord.create({
      data: {
        flockBatchId: input.flockBatchId,
        recordDate: new Date(input.recordDate),
        eggCount: input.eggCount,
        feedGrams: input.feedGrams,
        mortality: input.mortality,
        mortalityNotes: input.mortalityNotes,
        notes: input.notes,
        recordedBy: input.recordedBy,
      },
    });

    if (input.mortality > 0) {
      await tx.flockBatch.update({
        where: { id: input.flockBatchId },
        data: { currentCount: { decrement: input.mortality } },
      });
    }

    return created;
  });

  return context.json({ dailyRecord: record }, 201);
});

// ── Expenses ───────────────────────────────────────────────────────────

farmRouter.get("/expenses", async (context) => {
  const farmId = context.req.query("farmId");

  const expenses = await db.expense.findMany({
    where: {
      deletedAt: null,
      ...(farmId && { farmId }),
    },
    orderBy: { expenseDate: "desc" },
    take: 30,
  });

  return context.json({ expenses });
});

farmRouter.post("/expenses", async (context) => {
  const parsed = createExpenseSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const input = parsed.data;
  const expense = await db.expense.create({
    data: {
      farmId: input.farmId,
      flockBatchId: input.flockBatchId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      expenseDate: new Date(input.expenseDate),
    },
  });

  return context.json({ expense }, 201);
});

// ── Sales ──────────────────────────────────────────────────────────────

farmRouter.get("/sales", async (context) => {
  const farmId = context.req.query("farmId");

  const sales = await db.sale.findMany({
    where: {
      deletedAt: null,
      ...(farmId && { farmId }),
    },
    orderBy: { saleDate: "desc" },
    take: 30,
  });

  return context.json({ sales });
});

farmRouter.post("/sales", async (context) => {
  const parsed = createSaleSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const input = parsed.data;
  const sale = await db.sale.create({
    data: {
      farmId: input.farmId,
      flockBatchId: input.flockBatchId,
      saleType: input.saleType,
      description: input.description,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalAmount: input.totalAmount,
      currency: input.currency,
      saleDate: new Date(input.saleDate),
    },
  });

  return context.json({ sale }, 201);
});
