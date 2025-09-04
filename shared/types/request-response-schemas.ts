import { z } from "zod";
import type { Project, Sample } from "./primitives";

export const LoadProjectRequestSchema = z.object({
  projectId: z.string(),
});

export const LoadProjectResponseSchema = z.object({
  project: z.any(),
  samples: z.array(z.any()),
});

export type LoadProjectRequest = z.infer<typeof LoadProjectRequestSchema>;
export type LoadProjectResponse = {
  project: Project;
  samples: Sample[];
};

export const SaveChangesRequestSchema = z.object({
  changes: z.array(z.any()),
});

export type SaveChangesRequest = z.infer<typeof SaveChangesRequestSchema>;

export const GetProjectsRequestSchema = z.object({});

export const GetProjectsResponseSchema = z.object({
  projects: z.array(z.any()),
});

export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const CreateProjectResponseSchema = z.object({
  project: z.any(),
});

export const DeleteProjectRequestSchema = z.object({
  id: z.string(),
});

export const DeleteProjectResponseSchema = z.object({
  success: z.boolean(),
});

export type GetProjectsRequest = z.infer<typeof GetProjectsRequestSchema>;
export type GetProjectsResponse = {
  projects: Project[];
};

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type CreateProjectResponse = {
  project: Project;
};

export type DeleteProjectRequest = z.infer<typeof DeleteProjectRequestSchema>;
export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const SaveChangesResponseSchema = z.object({
  results: z.array(
    z.object({
      success: z.boolean(),
      change: z.any(),
      result: z.any().optional(),
      error: z.string().optional(),
    })
  ),
});

export type SaveChangesResponse = z.infer<typeof SaveChangesResponseSchema>;

export const AgentCommandResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  availableCommands: z.record(z.string()).optional(),
  context: z.any().optional(),
});

export type AgentCommandResponse = z.infer<typeof AgentCommandResponseSchema>;
