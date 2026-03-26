import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import ticketsRouter from "./routes/tickets";
import commentsRouter from "./routes/comments";
import dashboardRouter from "./routes/dashboard";
import type { AppVariables } from "./types";

const app = new Hono<{ Variables: AppVariables }>();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(logger());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ── Better Auth handler — mounts at /api/auth/* ───────────────────────────────
app.on(["POST", "GET"], "/api/auth/**", (c) =>
  auth.handler(c.req.raw)
);

// ── API routes ────────────────────────────────────────────────────────────────
app.route("/api/tickets", ticketsRouter);
app.route("/api/tickets", commentsRouter);
app.route("/api/dashboard", dashboardRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 3000);
console.log(`🚀 Backend corriendo en http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
