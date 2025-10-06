import type {
  D1Database,
  IncomingRequestCfProperties,
} from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { withCloudflare } from "better-auth-cloudflare";
import { admin } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../db";
import { CloudflareBindings } from "../env";
import { anonymous } from "better-auth/plugins";
const adminWhitelist = ["ryan@zenobiapay.com", "teddy@zenobiapay.com"];

function createAuth(
  env?: CloudflareBindings,
  cf?: IncomingRequestCfProperties,
) {
  const db = env
    ? drizzle(env.DB, { schema, logger: false })
    : ({} as ReturnType<typeof drizzle>);

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
              db: db as ReturnType<typeof drizzle>,
              options: {
                usePlural: true,
                debugLogs: true,
              },
            }
          : undefined,
        kv: env?.KV,
      },
      {
        baseURL: env?.BASE_URL,
        secret: env?.BETTER_AUTH_SECRET,
        advanced: {
          defaultCookieAttributes: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            partitioned: true,
          },
        },
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: false,
        },
        socialProviders: {
          google: {
            clientId: env?.GOOGLE_CLIENT_ID || "placeholder",
            clientSecret: env?.GOOGLE_CLIENT_SECRET || "placeholder",
            verifyIdToken(token, nonce) {
              return true;
            },
          },
        },
        rateLimit: {
          enabled: false,
        },
        plugins: [
          admin({
            defaultRole: "user",
            adminUsers: adminWhitelist.map((email) => ({ email })),
            impersonationSessionDuration: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      },
    ),
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: true,
            debugLogs: true,
          }),
        }),
    databaseHooks: {},
  });
}

export const auth = createAuth();

export { createAuth };
