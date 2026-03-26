import type { Context, Next } from "hono";
import type { AppVariables } from "../types";
import type { User } from "../db/schema";

export function requireRole(role: "agente" | "empleado") {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const user = c.get("user") as User;

    if (!user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    if (user.role !== role) {
      return c.json(
        { error: `Se requiere rol: ${role}` },
        403
      );
    }

    await next();
  };
}
