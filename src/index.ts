import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { createAuth } from "./auth";
import type { CloudflareBindings } from "./env";
import { ErrorResponseSchema } from "@shared/types/request-response-schemas";
import { ContentfulStatusCode } from "hono/utils/http-status";
import z from "zod";
import type { IncomingRequestCfProperties } from "@cloudflare/workers-types";

type Variables = {
  auth: ReturnType<typeof createAuth>;
};

export type HonoContext = Context<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>;

// Helper function to get authenticated user
export async function getAuthenticatedUser(c: HonoContext) {
  const auth = c.get("auth");
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.session || !session?.user) {
    return null;
  }

  return session.user;
}

export function send<S extends z.ZodTypeAny>(
  c: Context<{ Bindings: CloudflareBindings }>,
  schema: S,
  data: z.output<S>,
  status: ContentfulStatusCode
) {
  // Runtime assert- disabled in production
  if (c.env.BASE_URL?.includes("localhost")) {
    try {
      schema.parse(data);
    } catch (error) {
      console.error(
        "🔴 API returning unexpected response, throwing error in local dev mode. Details:"
      );
      console.error("Issues found:", JSON.stringify(error, null, 2));
      console.log("Data returned:", JSON.stringify(data, null, 2));
      console.log("Expected Schema:", JSON.stringify(schema, null, 2));
      throw new Error();
    }
  }
  return c.json(data, status);
}

export function sendError(
  c: Context<{ Bindings: CloudflareBindings }>,
  code: ContentfulStatusCode,
  error: string
) {
  return send(
    c,
    ErrorResponseSchema,
    {
      success: false,
      error,
      statusCode: code,
    },
    code
  );
}

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

// Middleware to initialize auth instance for each request (MUST come first)
app.use("*", async (c, next) => {
  console.log("path request", c.req.path);
  const cf = (c.req.raw as Request & { cf?: IncomingRequestCfProperties }).cf || {};
  const auth = createAuth(c.env, cf);
  c.set("auth", auth);

  await next();
});

// CORS configuration for auth routes
app.use(
  "/api/auth/**",
  cors({
    origin: "*", // In production, replace with your actual domain
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// CORS configuration for API routes
app.use(
  "/api/**",
  cors({
    origin: "*", // In production, replace with your actual domain
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Handle all auth routes
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// Add 404 route
app.get("*", (c) => {
  return c.html("<div>404 - Page Not Found :/</div>");
});

export default app;
export { UserShard } from "./durable-objects/user-shard/UserShard";
