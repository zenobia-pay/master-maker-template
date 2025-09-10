import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { createAuth } from "./auth";
import type { CloudflareBindings } from "./env";
import {
  ErrorResponseSchema,
  LoadDashboardResponseSchema,
  SaveDashboardRequestSchema,
  SaveDashboardResponseSchema,
} from "@shared/types/request-response-schemas";
import type { Change } from "@shared/types/events";
import { ContentfulStatusCode } from "hono/utils/http-status";
import z from "zod";

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
  c: Context,
  schema: S,
  data: z.output<S>,
  status: ContentfulStatusCode
) {
  // Runtime assert- disabled in production
  if (c.env.BASE_URL && c.env.BASE_URL.includes("localhost")) {
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
  c: Context,
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
  const auth = createAuth(c.env, (c.req.raw as any).cf || {});
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

// Dashboard endpoints
app.get("/api/dashboard/load", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return sendError(c, 401, "Unauthorized");
  }

  const shardId = c.env.USER_SHARD.idFromName(user.id);
  const userShard = c.env.USER_SHARD.get(shardId);

  const result = await userShard.loadDashboard();

  if ("error" in result) {
    return sendError(c, 500, result.error);
  }

  return send(c, LoadDashboardResponseSchema, result, 200);
});

app.post(
  "/api/dashboard/save",
  zValidator("json", SaveDashboardRequestSchema),
  async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return sendError(c, 401, "Unauthorized");
      }

      const { changes } = c.req.valid("json");

      const shardId = c.env.USER_SHARD.idFromName(user.id);
      const userShard = c.env.USER_SHARD.get(shardId);

      const result = await userShard.saveDashboard(changes as Change[]);
      if ("error" in result) {
        return sendError(c, result.statusCode as any, result.error);
      }

      return send(c, SaveDashboardResponseSchema, result, 200);
    } catch (error) {
      console.error("Save dashboard error:", error);
      return sendError(
        c,
        500,
        "Failed to save changes: " + (error as Error).message
      );
    }
  }
);

// Add 404 route
app.get("*", (c) => {
  return c.html("<div>404 - Page Not Found :/</div>");
});

export default app;
export { UserShard } from "./durable-objects/user-shard/UserShard";
