import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  LoadProjectRequestSchema,
  LoadProjectResponseSchema,
  SaveChangesRequestSchema,
  SaveChangesResponseSchema,
  AgentCommandResponseSchema,
} from "@shared/types/request-response-schemas";
import { CloudflareBindings } from "~/env";
import { getAuthenticatedUser, send, sendError, Variables } from "../utils";
import z from "zod";
import { ContentfulStatusCode } from "hono/utils/http-status";

const router = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();

router.get(
  "/:id/load-project",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return sendError(c, 401, "Unauthorized");
    }

    const projectId = c.req.valid("param").id;

    const shardId = c.env.USER_SHARD.idFromName(user.id);
    const userShard = c.env.USER_SHARD.get(shardId);

    const result = await userShard.loadProject(projectId);

    if ("error" in result) {
      return sendError(c, 500, result.error);
    }

    return send(c, LoadProjectResponseSchema, result, 200);
  }
);

router.post(
  "/:projectId/save",
  zValidator("json", SaveChangesRequestSchema),
  async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return sendError(c, 401, "Unauthorized");
      }

      const projectId = c.req.param("projectId");
      const { changes } = c.req.valid("json");

      // Get UserShard for this user
      const shardId = c.env.USER_SHARD.idFromName(user.id);
      const userShard = c.env.USER_SHARD.get(shardId);

      // Save changes using UserShard
      const result = await userShard.saveChanges(changes, projectId);
      if ("error" in result) {
        return sendError(
          c,
          result.statusCode as ContentfulStatusCode,
          result.error
        );
      }

      return send(c, SaveChangesResponseSchema, result, 200);
    } catch (error) {
      console.error("Save changes error:", error);
      return sendError(
        c,
        500,
        "Failed to save changes: " + (error as Error).message
      );
    }
  }
);

router.post("/agent-command", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return sendError(c, 401, "Unauthorized");
  }

  const { command, context } = await c.req.json();

  const shardId = c.env.USER_SHARD.idFromName(user.id);
  const userShard = c.env.USER_SHARD.get(shardId);

  const result = await userShard.executeAgentCommand(command, context);

  if ("error" in result) {
    return sendError(c, 500, result.error.message);
  }

  return send(c, AgentCommandResponseSchema, result, 200);
});

export default router;
