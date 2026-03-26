import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { tickets, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import type { User } from "../db/schema";
import type { AppVariables } from "../types";

const app = new Hono<{ Variables: AppVariables }>();

// ── Validación ───────────────────────────────────────────────────────────────
const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.enum(["hardware", "software", "red", "accesos", "otro"]),
  priority: z.enum(["critica", "alta", "media", "baja"]),
});

const updateStatusSchema = z.object({
  status: z.enum(["abierto", "en_progreso", "resuelto", "cerrado"]),
});

// Transiciones válidas — no se puede saltar estados
const VALID_TRANSITIONS: Record<string, string[]> = {
  abierto: ["en_progreso"],
  en_progreso: ["resuelto"],
  resuelto: ["cerrado"],
  cerrado: [],
};

// ── GET /tickets ─────────────────────────────────────────────────────────────
app.get("/", requireAuth, async (c) => {
  const user = c.get("user") as User;
  const { status, priority, category } = c.req.query();

  let query = db
    .select({
      ticket: tickets,
      creator: { id: users.id, name: users.name, email: users.email },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.createdBy, users.id))
    .$dynamic();

  const conditions = [];

  // Empleados solo ven sus propios tickets
  if (user.role === "empleado") {
    conditions.push(eq(tickets.createdBy, user.id));
  }

  if (status) conditions.push(eq(tickets.status, status as any));
  if (priority) conditions.push(eq(tickets.priority, priority as any));
  if (category) conditions.push(eq(tickets.category, category as any));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query.orderBy(sql`${tickets.createdAt} DESC`);
  return c.json(result);
});

// ── GET /tickets/:id ─────────────────────────────────────────────────────────
app.get("/:id", requireAuth, async (c) => {
  const user = c.get("user") as User;
  const id = c.req.param("id");

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id!));

  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  // Empleados solo pueden ver sus propios tickets
  if (user.role === "empleado" && ticket.createdBy !== user.id) {
    return c.json({ error: "No autorizado" }, 403);
  }

  return c.json(ticket);
});

// ── POST /tickets ─────────────────────────────────────────────────────────────
app.post(
  "/",
  requireAuth,
  zValidator("json", createTicketSchema),
  async (c) => {
    const user = c.get("user") as User;
    const body = c.req.valid("json");

    const [ticket] = await db
      .insert(tickets)
      .values({
        ...body,
        createdBy: user.id,
        status: "abierto",
      })
      .returning();

    return c.json(ticket, 201);
  }
);

// ── PATCH /tickets/:id/status ─────────────────────────────────────────────────
app.patch(
  "/:id/status",
  requireAuth,
  zValidator("json", updateStatusSchema),
  async (c) => {
    const user = c.get("user") as User;
    const id = c.req.param("id");
    const { status: newStatus } = c.req.valid("json");

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));

    if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

    // Solo agentes pueden cambiar estado
    if (user.role !== "agente") {
      return c.json({ error: "Solo los agentes pueden cambiar el estado" }, 403);
    }

    // El ticket debe estar asignado al agente que intenta cambiar el estado
    if (ticket.assignedTo !== user.id) {
      return c.json(
        { error: "Solo el agente asignado puede cambiar el estado" },
        403
      );
    }

    // Validar transición de estado
    const allowed = VALID_TRANSITIONS[ticket.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return c.json(
        {
          error: `Transición inválida: ${ticket.status} → ${newStatus}`,
          allowed,
        },
        422
      );
    }

    const updateData: Record<string, any> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // resolved_at se llena automáticamente al resolver
    if (newStatus === "resuelto") {
      updateData.resolvedAt = new Date();
    }

    const [updated] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();

    return c.json(updated);
  }
);

// ── PATCH /tickets/:id/assign ─────────────────────────────────────────────────
app.patch("/:id/assign", requireAuth, requireRole("agente"), async (c) => {
  const user = c.get("user") as User;
  const id = c.req.param("id");

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id!));
  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  const [updated] = await db
    .update(tickets)
    .set({ assignedTo: user.id, updatedAt: new Date() })
    .where(eq(tickets.id, id!))
    .returning();

  return c.json(updated);
});

export default app;
