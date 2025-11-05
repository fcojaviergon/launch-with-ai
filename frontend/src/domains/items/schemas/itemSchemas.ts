import { z } from "zod"

// Item create schema
export const itemCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
})

export type ItemCreateFormData = z.infer<typeof itemCreateSchema>

// Item update schema
export const itemUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional().nullable(),
  description: z.string().optional().nullable(),
})

export type ItemUpdateFormData = z.infer<typeof itemUpdateSchema>
