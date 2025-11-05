import { z } from "zod";

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  statusCode: z.number(),
  error: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
