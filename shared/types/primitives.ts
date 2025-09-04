import * as userShardSchema from "../../src/durable-objects/user-shard/schema";

// Export types derived from the database schema
export type Project = typeof userShardSchema.projects.$inferSelect;
export type Sample = typeof userShardSchema.samples.$inferSelect;

// Export ProjectSettings type (defined in schema)
export type ProjectSettings = userShardSchema.ProjectSettings;