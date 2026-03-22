import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Tenant ─────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "green-pastures" },
    update: {},
    create: {
      name: "Green Pastures Farm Ltd",
      slug: "green-pastures",
      currency: "NGN",
    },
  });
  console.log(`  Tenant: ${tenant.name} (${tenant.id})`);

  // ── User ───────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "manager@farmoss.app" },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: "100001",
      email: "manager@farmoss.app",
      name: "Farm Manager",
      role: "owner",
      passwordHash: "demo-hash-not-for-production",
    },
  });
  console.log(`  User: ${user.name} (${user.email}, ID: ${user.userId})`);

  // ── Farm ───────────────────────────────────────────────────────────
  let farm = await prisma.farm.findFirst({
    where: { tenantId: tenant.id, name: "Green Pastures Farm" },
  });
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        tenantId: tenant.id,
        name: "Green Pastures Farm",
        location: "Ibadan, Nigeria",
      },
    });
  }
  console.log(`  Farm: ${farm.name} (${farm.id})`);

  // ── Flock Batches ──────────────────────────────────────────────────
  const layerBatch = await prisma.flockBatch.create({
    data: {
      farmId: farm.id,
      name: "Layers Batch A – Jan 2026",
      birdType: "layer",
      initialCount: 1000,
      currentCount: 994,
      startDate: new Date("2026-01-01"),
      status: "active",
    },
  });
  console.log(`  FlockBatch: ${layerBatch.name} (${layerBatch.id})`);

  const broilerBatch = await prisma.flockBatch.create({
    data: {
      farmId: farm.id,
      name: "Broilers Batch B – Feb 2026",
      birdType: "broiler",
      initialCount: 500,
      currentCount: 498,
      startDate: new Date("2026-02-15"),
      status: "active",
    },
  });
  console.log(`  FlockBatch: ${broilerBatch.name} (${broilerBatch.id})`);

  // ── Daily Records (last 7 days for layers) ─────────────────────────
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    await prisma.dailyRecord.create({
      data: {
        flockBatchId: layerBatch.id,
        recordDate: new Date(dateStr),
        eggCount: 800 + Math.floor(Math.random() * 60),
        feedGrams: 120000 + Math.floor(Math.random() * 10000),
        mortality: i === 3 ? 2 : i === 5 ? 1 : 0,
        notes: i === 0 ? "Good production day" : undefined,
        recordedBy: user.id,
      },
    });
  }
  console.log("  DailyRecords: 7 records for layers batch");

  // ── Daily Records (last 3 days for broilers) ───────────────────────
  for (let i = 2; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    await prisma.dailyRecord.create({
      data: {
        flockBatchId: broilerBatch.id,
        recordDate: new Date(dateStr),
        feedGrams: 75000 + Math.floor(Math.random() * 5000),
        mortality: i === 1 ? 1 : 0,
        recordedBy: user.id,
      },
    });
  }
  console.log("  DailyRecords: 3 records for broilers batch");

  // ── Expenses (amounts in kobo: 1 NGN = 100 kobo) ────────────────────
  await prisma.expense.create({
    data: {
      farmId: farm.id,
      flockBatchId: layerBatch.id,
      category: "feed",
      description: "Layer mash – 50 bags",
      amount: 75_000_000, // ₦750,000
      currency: "NGN",
      expenseDate: new Date("2026-03-15"),
    },
  });

  await prisma.expense.create({
    data: {
      farmId: farm.id,
      category: "labor",
      description: "Monthly staff wages",
      amount: 45_000_000, // ₦450,000
      currency: "NGN",
      expenseDate: new Date("2026-03-01"),
    },
  });
  console.log("  Expenses: 2 records");

  // ── Sales (amounts in kobo) ────────────────────────────────────────
  await prisma.sale.create({
    data: {
      farmId: farm.id,
      flockBatchId: layerBatch.id,
      saleType: "eggs",
      description: "Crate sales – wholesale",
      quantity: 50,
      unitPrice: 350_000, // ₦3,500 per crate
      totalAmount: 17_500_000, // ₦175,000
      currency: "NGN",
      saleDate: new Date("2026-03-20"),
    },
  });
  console.log("  Sales: 1 record");

  // ── Cage Units (battery cage system for layers) ─────────────────────
  const cageLabels = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2"];
  const cageUnits = [];
  for (const cageLabel of cageLabels) {
    const cage = await prisma.cageUnit.create({
      data: {
        flockBatchId: layerBatch.id,
        label: cageLabel,
        birdCount: 5 + Math.floor(Math.random() * 3), // 5-7 birds per cage
        startDate: new Date("2026-01-01"),
        status: "active",
        notes:
          cageLabel === "A1"
            ? "Top-tier performance cage"
            : cageLabel === "C2"
              ? "Recently restocked"
              : undefined,
      },
    });
    cageUnits.push(cage);
  }
  console.log(`  CageUnits: ${cageUnits.length} cages for layers batch`);

  // ── Cage Production (last 5 days for all cages) ─────────────────────
  let cageProductionCount = 0;
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    for (const cage of cageUnits) {
      await prisma.cageProduction.create({
        data: {
          cageUnitId: cage.id,
          recordDate: new Date(dateStr),
          eggCount: Math.max(0, cage.birdCount - Math.floor(Math.random() * 2)),
          feedGrams: 300 + Math.floor(Math.random() * 200), // 300-500g per cage
          mortality: i === 2 && cage.label === "B1" ? 1 : 0,
          notes:
            i === 0 && cage.label === "A1"
              ? "Strong production day"
              : undefined,
        },
      });
      cageProductionCount++;
    }
  }
  console.log(
    `  CageProduction: ${cageProductionCount} records (${cageUnits.length} cages × 5 days)`,
  );

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
