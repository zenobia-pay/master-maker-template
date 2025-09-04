import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Use crypto.randomUUID() instead of nanoid to avoid ES module issues
const generateId = () => crypto.randomUUID();

// Define types first
export interface ProjectSettings {
  resolution: { width: number; height: number };
  fps: number;
  backgroundColor: string;
}

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  settings: text("settings", { mode: "json" }).$type<ProjectSettings>(),
});

// Sample table with various column types for demonstration
export const samples = sqliteTable("samples", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["draft", "active", "completed", "archived"] })
    .notNull()
    .default("draft"),
  value: real("value"),
  count: integer("count").notNull().default(0),
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
