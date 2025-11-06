import { z } from "zod"

// Create conversation schema
export const conversationCreateSchema = z.object({
  analysis_id: z.string().uuid("Invalid analysis ID format"),
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  use_documents: z.boolean().default(true),
})

export type ConversationCreateFormData = z.infer<typeof conversationCreateSchema>

// Send message schema
export const messageSendSchema = z.object({
  role: z.literal("user"),
  content: z.string().min(1, "Message cannot be empty").max(10000, "Message is too long"),
  use_documents: z.boolean().default(true),
})

export type MessageSendFormData = z.infer<typeof messageSendSchema>
