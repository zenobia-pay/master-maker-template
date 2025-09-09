import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { createAuth } from "./auth";
import editorRoutes from "./routes/editor";
import type { CloudflareBindings } from "./env";
import {
  LoadDashboardResponseSchema,
  SaveDashboardRequestSchema,
  SaveDashboardResponseSchema,
} from "@shared/types/request-response-schemas";
import { getAuthenticatedUser, send, sendError } from "./routes/utils";
import type { Change } from "@shared/types/events";

type Variables = {
  auth: ReturnType<typeof createAuth>;
};

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
