import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../../user-shard-drizzle/migrations";
import * as schema from "../../db/userShard.schema";
import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";

type UserShardEnv = {
  DB: D1Database;
  USER_SHARD: DurableObjectNamespace;
  BUCKET: R2Bucket;
  BETTER_AUTH_SECRET: string;
};

export class UserShard extends DurableObject<UserShardEnv> {
  private shardDb: DrizzleSqliteDODatabase<typeof schema>;
  private d1Db: DrizzleD1Database;
  private storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState, env: UserShardEnv) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.shardDb = drizzle(this.storage, { schema, logger: true });
    this.d1Db = drizzleD1(env.DB);

    // Run migrations before accepting any requests
    void ctx.blockConcurrencyWhile(async () => {
      await this.migrate();
    });
  }

  private async migrate() {
    await migrate(this.shardDb, migrations);
  }
}
