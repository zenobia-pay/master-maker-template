import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../../user-shard-drizzle/migrations";
import * as schema from "./schema";

type UserShardEnv = {
  DB: D1Database;
  USER_SHARD: DurableObjectNamespace;
  BUCKET: R2Bucket;
  BETTER_AUTH_SECRET: string;
};

export class UserShard extends DurableObject<UserShardEnv> {
  private db: DrizzleSqliteDODatabase<typeof schema>;
  private storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState, env: UserShardEnv) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.db = drizzle(this.storage, { schema, logger: true });

    // Run migrations before accepting any requests
    ctx.blockConcurrencyWhile(async () => {
      await this.migrate();
    });
  }

  private async migrate() {
    await migrate(this.db, migrations);
  }
}
