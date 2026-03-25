import { Hono } from "hono";
import { eq, sql, lt, isNull, and } from "drizzle-orm";
import { db } from "../db";
import { tickets } from "../db/schema";
import { requireAuth } from "../middleware/auth";

const app = new Hono();

app.get("/", requireAuth, async (c) => {
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Tickets por estado
  const byStatus = await db
    .select({
      status: tickets.status,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .groupBy(tickets.status);

  // Tickets por prioridad
  const byPriority = await db
    .select({
      priority: tickets.priority,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .groupBy(tickets.priority);

  // Promedio de tiempo de resolución en horas (SQL, no JS)
  const [avgResolution] = await db
    .select({
      avgHours: sql<number>`
        ROUND(
          AVG(
            EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
          )::numeric,
          2
        )
      `,
    })
    .from(tickets)
    .where(eq(tickets.status, "resuelto"));

  // Tickets abiertos hace más de 48hs sin asignar
  const [{ count: unassignedOld }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(
      and(
        eq(tickets.status, "abierto"),
        isNull(tickets.assignedTo),
        lt(tickets.createdAt, fortyEightHoursAgo)
      )
    );

  // 5 tickets más recientes
  const recent = await db
    .select()
    .from(tickets)
    .orderBy(sql`${tickets.createdAt} DESC`)
    .limit(5);

  return c.json({
    byStatus,
    byPriority,
    avgResolutionHours: avgResolution.avgHours ?? 0,
    unassignedOlderThan48h: unassignedOld,
    recentTickets: recent,
  });
});

export default app;
