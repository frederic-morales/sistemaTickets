import { pgTable, uuid, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["empleado", "agente"]);
export const categoryEnum = pgEnum("category", [
  "hardware",
  "software",
  "red",
  "accesos",
  "otro",
]);
export const priorityEnum = pgEnum("priority", [
  "critica",
  "alta",
  "media",
  "baja",
]);
export const statusEnum = pgEnum("status", [
  "abierto",
  "en_progreso",
  "resuelto",
  "cerrado",
]);

// ── Tables ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  role: roleEnum("role").notNull().default("empleado"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Better Auth requires these tables — managed by better-auth internally
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  priority: priorityEnum("priority").notNull(),
  status: statusEnum("status").notNull().default("abierto"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  assignedTo: text("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type NewComment = typeof comments.$inferInsert;
