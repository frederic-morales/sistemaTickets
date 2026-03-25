import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { comments, tickets, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { User } from "../db/schema";

const app = new Hono();

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// ── GET /tickets/:ticketId/comments ──────────────────────────────────────────
app.get("/:ticketId/comments", requireAuth, async (c) => {
  const user = c.get("user") as User;
  const ticketId = c.req.param("ticketId");

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId));

  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  if (user.role === "empleado" && ticket.createdBy !== user.id) {
    return c.json({ error: "No autorizado" }, 403);
  }

  const result = await db
    .select({
      comment: comments,
      author: { id: users.id, name: users.name },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.ticketId, ticketId))
    .orderBy(comments.createdAt);

  return c.json(result);
});

// ── POST /tickets/:ticketId/comments ─────────────────────────────────────────
app.post(
  "/:ticketId/comments",
  requireAuth,
  zValidator("json", commentSchema),
  async (c) => {
    const user = c.get("user") as User;
    const ticketId = c.req.param("ticketId");
    const { content } = c.req.valid("json");

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId));

    if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

    // Solo el creador o el agente asignado pueden comentar
    const canComment =
      user.role === "agente" ||
      ticket.createdBy === user.id ||
      ticket.assignedTo === user.id;

    if (!canComment) {
      return c.json({ error: "No autorizado para comentar" }, 403);
    }

    const [comment] = await db
      .insert(comments)
      .values({ ticketId, userId: user.id, content })
      .returning();

    return c.json(comment, 201);
  }
);

export default app;
