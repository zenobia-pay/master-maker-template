import type {
  D1Database,
  KVNamespace,
  Fetcher,
  R2Bucket,
  Queue,
  VectorizeIndex,
} from "@cloudflare/workers-types";

export interface CloudflareBindings {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  OPENAI_API_KEY: string;
  BASE_URL: string;
  KV: KVNamespace;
  BETTER_AUTH_SECRET: string;
  USER_SHARD: DurableObjectNamespace<import("./index").UserShard>;
  MEDIA_BUCKET: R2Bucket;
  DB: D1Database;
  ASSETS: Fetcher;
}
