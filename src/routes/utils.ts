import type { Context } from "hono";
import { createAuth } from "../auth";
import type { CloudflareBindings } from "../env";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { ErrorResponseSchema } from "@shared/types/request-response-schemas";

export type Variables = {
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
