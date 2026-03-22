import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { farmRouter } from "./rest/farm";
import type { ApiContext } from "./rest/types";
import { appRouter } from "./trpc/routers/_app";
import { createTRPCContext } from "./trpc/init";

const app = new OpenAPIHono<ApiContext>();

app.use(secureHeaders());

app.use(
  "/api/*",
  cors({
    origin: process.env.ALLOWED_API_ORIGINS?.split(",") ?? ["http://localhost:3501", "http://localhost:3901"],
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "accept-language",
      "x-trpc-source",
      "x-user-timezone"
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400
  })
);

app.get("/", (context) =>
  context.json({
    message: "Farm OSS API",
    mode: "gnd-inspired-foundation",
    product: "farm-operations-tracker",
    status: "ok"
  })
);

app.get("/api/health", (context) =>
  context.json({
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString()
  })
);

app.route("/api", farmRouter);

app.use(
  "/api/trpc/*",
  trpcServer({
    createContext: createTRPCContext,
    endpoint: "/api/trpc",
    router: appRouter
  })
);

const port = Number(process.env.PORT ?? 3001);

export { app };
export default {
  fetch: app.fetch,
  port
};

serve(
  {
    fetch: app.fetch,
    port
  },
  () => {
    console.log(`api listening on http://localhost:${port}`);
  }
);
