import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./user-shard-drizzle",
  schema: "./src/durable-objects/user-shard/schema.ts",
  dialect: "sqlite",
  driver: "durable-sqlite",
});
