import type {
  D1Database,
  IncomingRequestCfProperties,
} from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { withCloudflare, createKVStorage } from "better-auth-cloudflare";
import { admin } from "better-auth/plugins";
import { genericOAuth } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../db";
const adminWhitelist: string[] = [];

function createAuth(env?: Env, cf?: IncomingRequestCfProperties) {
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
        secondaryStorage: env?.KV ? createKVStorage(env.KV) : undefined,
        advanced: {
          defaultCookieAttributes: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            partitioned: true,
          },
        },
        oauthConfig: {
          skipStateCookieCheck: true, // Skip cookie check since we're using a proxy that redirects through multiple domains
        },
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: false,
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
          ...(env?.DOLPHIN_INTEGRATIONS_URL
            ? [
                genericOAuth({
                  config: [
                    {
                      providerId: "google",
                      clientId: env.DOLPHIN_INTEGRATIONS_CLIENT_ID as string,
                      clientSecret:
                        env.DOLPHIN_INTEGRATIONS_CLIENT_SECRET as string,
                      authorizationUrl: `${env.DOLPHIN_INTEGRATIONS_URL}/auth/google`,
                      tokenUrl: `${env.DOLPHIN_INTEGRATIONS_URL}/auth/google/token`,
                      userInfoUrl: `${env.DOLPHIN_INTEGRATIONS_URL}/auth/google/userinfo`,
                      scopes: ["openid", "email", "profile"],
                      pkce: true, // Enable PKCE for secure OAuth flow
                      redirectURI: `${env.BASE_URL}/api/auth/oauth2/callback/google`, // Better-auth expects callback here
                    },
                  ],
                }),
              ]
            : []),
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
