import { db } from "@farm-oss/db";
import { Hono } from "hono";
import type { ApiContext } from "./types";

export const farmRouter = new Hono<ApiContext>();

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

// ── Farms ──────────────────────────────────────────────────────────────

farmRouter.get("/farms", async (context) => {
  const tenantId = context.req.query("tenantId");

  const farms = await db.farm.findMany({
    where: {
      deletedAt: null,
      ...(tenantId && { tenantId })
    },
    orderBy: { name: "asc" }
  });

  return context.json({ farms });
});

farmRouter.post("/farms", async (context) => {
  const body = await context.req.json();

  const farm = await db.farm.create({
    data: {
      tenantId: body.tenantId,
      name: body.name,
      location: body.location
    }
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
        orderBy: { startDate: "desc" }
      }
    }
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
      ...(farmId && { farmId })
    },
    orderBy: { startDate: "desc" }
  });

  return context.json({ flockBatches: batches });
});

farmRouter.post("/flock-batches", async (context) => {
  const body = await context.req.json();

  const batch = await db.flockBatch.create({
    data: {
      farmId: body.farmId,
      name: body.name,
      birdType: body.birdType,
      initialCount: body.initialCount,
      currentCount: body.initialCount,
      startDate: new Date(body.startDate),
      status: "active"
    }
  });

  return context.json({ flockBatch: batch }, 201);
});

farmRouter.get("/flock-batches/:id", async (context) => {
  const id = context.req.param("id");

  const batch = await db.flockBatch.findFirst({
    where: { id, deletedAt: null },
    include: {
      farm: { select: { id: true, name: true } }
    }
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
      ...(flockBatchId && { flockBatchId })
    },
    orderBy: { recordDate: "desc" },
    take: Math.min(limit, 100)
  });

  return context.json({ dailyRecords: records });
});

farmRouter.post("/daily-records", async (context) => {
  const body = await context.req.json();

  const record = await db.$transaction(async (tx) => {
    const created = await tx.dailyRecord.create({
      data: {
        flockBatchId: body.flockBatchId,
        recordDate: new Date(body.recordDate),
        eggCount: body.eggCount,
        feedGrams: body.feedGrams,
        mortality: body.mortality ?? 0,
        mortalityNotes: body.mortalityNotes,
        notes: body.notes,
        recordedBy: body.recordedBy
      }
    });

    if (body.mortality > 0) {
      await tx.flockBatch.update({
        where: { id: body.flockBatchId },
        data: { currentCount: { decrement: body.mortality } }
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
      ...(farmId && { farmId })
    },
    orderBy: { expenseDate: "desc" },
    take: 30
  });

  return context.json({ expenses });
});

farmRouter.post("/expenses", async (context) => {
  const body = await context.req.json();

  const expense = await db.expense.create({
    data: {
      farmId: body.farmId,
      flockBatchId: body.flockBatchId,
      category: body.category,
      description: body.description,
      amount: body.amount,
      currency: body.currency ?? "NGN",
      expenseDate: new Date(body.expenseDate)
    }
  });

  return context.json({ expense }, 201);
});

// ── Sales ──────────────────────────────────────────────────────────────

farmRouter.get("/sales", async (context) => {
  const farmId = context.req.query("farmId");

  const sales = await db.sale.findMany({
    where: {
      deletedAt: null,
      ...(farmId && { farmId })
    },
    orderBy: { saleDate: "desc" },
    take: 30
  });

  return context.json({ sales });
});

farmRouter.post("/sales", async (context) => {
  const body = await context.req.json();

  const sale = await db.sale.create({
    data: {
      farmId: body.farmId,
      flockBatchId: body.flockBatchId,
      saleType: body.saleType,
      description: body.description,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      totalAmount: body.totalAmount,
      currency: body.currency ?? "NGN",
      saleDate: new Date(body.saleDate)
    }
  });

  return context.json({ sale }, 201);
});

