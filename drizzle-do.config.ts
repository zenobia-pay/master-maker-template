import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./user-shard-drizzle",
  schema: "./src/db/userShard.schema.ts",
  dialect: "sqlite",
  driver: "durable-sqlite",
});
