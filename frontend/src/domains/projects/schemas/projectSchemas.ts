import { z } from "zod"

// Project create schema
export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Project name must be less than 200 characters"),
  description: z.string().optional().nullable(),
  system_prompt: z.string().optional().nullable(),
  max_context_tokens: z.number().min(1000, "Minimum 1000 tokens").max(1000000, "Maximum 1M tokens").default(100000),
})

export type ProjectCreateFormData = z.infer<typeof projectCreateSchema>

// Project update schema
export const projectUpdateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Project name must be less than 200 characters").optional(),
  description: z.string().optional().nullable(),
  system_prompt: z.string().optional().nullable(),
  max_context_tokens: z.number().min(1000, "Minimum 1000 tokens").max(1000000, "Maximum 1M tokens").optional(),
})

export type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>
