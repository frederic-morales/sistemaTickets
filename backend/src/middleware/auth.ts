import type { Context, Next } from "hono";
import type { AppVariables } from "../types";
import { auth } from "../lib/auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function requireAuth(c: Context<{ Variables: AppVariables }>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "No autorizado" }, 401);
  }

  // Fetch full user with role from our users table
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) {
    return c.json({ error: "Usuario no encontrado" }, 401);
  }

  c.set("user", user);
  await next();
}
