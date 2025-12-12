import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";

// User properties table. Modify this table to add properties stored per user. Do NOT modify the users table.
export const userProperties = sqliteTable("user_properties", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lorem: text("lorem"),
  ipsum: text("ipsum"),
});

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Add more tables down here.
