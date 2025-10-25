import { DurableObject } from "cloudflare:workers";
import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";

export class UserShard extends DurableObject<Env> {
  private db: DrizzleD1Database;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.db = drizzleD1(env.DB);
  }
}
