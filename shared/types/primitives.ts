import * as authSchema from "../../src/db/auth.schema";
import * as d1Schema from "../../src/db/d1.schema";

// Export DB types derived from the schema

export type User = typeof authSchema.users.$inferSelect;
export type Session = typeof authSchema.sessions.$inferSelect;
export type Account = typeof authSchema.accounts.$inferSelect;
export type Verification = typeof authSchema.verifications.$inferSelect;
