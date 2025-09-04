import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  GetProjectsRequestSchema,
  CreateProjectRequestSchema,
  DeleteProjectRequestSchema,
  GetProjectsResponseSchema,
  CreateProjectResponseSchema,
  DeleteProjectResponseSchema,
} from "@shared/types/request-response-schemas";
import { CloudflareBindings } from "~/env";
import { getAuthenticatedUser, send, sendError, Variables } from "../utils";

const router = new Hono<{
  Bindings: CloudflareBindings;
  Variables: Variables;
}>();

router.get("/", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return sendError(c, 401, "Unauthorized");
  }

  const shardId = c.env.USER_SHARD.idFromName(user.id);
  const userShard = c.env.USER_SHARD.get(shardId);

  const result = await userShard.getProjects();

  if ("error" in result) {
    return sendError(c, 500, result.error);
  }

  return send(c, GetProjectsResponseSchema, result, 200);
});

router.post("/", zValidator("json", CreateProjectRequestSchema), async (c) => {
  const request = c.req.valid("json");
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return sendError(c, 401, "Unauthorized");
  }

  const shardId = c.env.USER_SHARD.idFromName(user.id);
  const userShard = c.env.USER_SHARD.get(shardId);

  const result = await userShard.createProject({ ...request, userId: user.id });

  if ("error" in result) {
    return sendError(c, 500, result.error);
  }

  return send(c, CreateProjectResponseSchema, result, 200);
});

router.delete("/:id", async (c) => {
  const projectId = c.req.param("id");
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return sendError(c, 401, "Unauthorized");
  }

  const shardId = c.env.USER_SHARD.idFromName(user.id);
  const userShard = c.env.USER_SHARD.get(shardId);

  const result = await userShard.deleteProject(projectId);

  if ("error" in result) {
    return sendError(c, 500, result.error);
  }

  return send(c, DeleteProjectResponseSchema, result, 200);
});

export default router;
