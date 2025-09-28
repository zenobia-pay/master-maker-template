import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Use crypto.randomUUID() instead of nanoid to avoid ES module issues
const generateId = () => crypto.randomUUID();

// Use drizzle schema to create tables. So it will look something like this:
// export const settings = sqliteTable("settings", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => generateId()),
//   name: text("name").notNull().default("Your name"),
//   email: text("email"),
// });
