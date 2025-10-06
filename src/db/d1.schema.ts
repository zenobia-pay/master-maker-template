import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// This is an example table. Delete it and replace it with your own tables.
export const stub = sqliteTable("stub", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
