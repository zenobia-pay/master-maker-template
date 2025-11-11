import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";

// User properties table. Modify this table to add properties stored per user. Do NOT modify the users table.
export const userProperties = sqliteTable("user_properties", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lorem: text("lorem"),
  ipsum: text("ipsum"),
});

// Add more tables down here.
