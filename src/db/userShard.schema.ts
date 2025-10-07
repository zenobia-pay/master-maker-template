import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// This file is for tables that will be sharded per user. Do not add tables here that need to be shared between users.

const generateId = () => crypto.randomUUID();

// Use drizzle schema to create tables. So it will look something like this:
// export const sampleTable = sqliteTable("sampleTable", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => generateId()),
//   sampleColumn: text("sampleColumn").notNull().default("Default value"),
//   sampleColumn2: text("sampleColumn2"),
// });
