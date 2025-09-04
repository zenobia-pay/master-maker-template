import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import editorRoutes from "./routes/editor";
import projectRoutes from "./routes/projects";
import type { CloudflareBindings } from "./env";

type Variables = {
  auth: ReturnType<typeof createAuth>;
};

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

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

// Middleware to initialize auth instance for each request
app.use("*", async (c, next) => {
  console.log("path request", c.req.path);
  const auth = createAuth(c.env, (c.req.raw as any).cf || {});
  c.set("auth", auth);

  await next();
});

// Handle all auth routes
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// Handle all auth routes
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.route("/api", editorRoutes);
app.route("/api/projects", projectRoutes);

export default app;
export { UserShard } from "./durable-objects/user-shard/UserShard";
