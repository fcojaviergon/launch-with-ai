// Chat domain types - re-export from types.ts (OpenAPI generated)
import type { Conversation, MessageChat } from "./types"

export type { Conversation, MessageChat }

// Type aliases for conversation creation
export type ConversationCreate = {
  project_id?: string
  title: string
  use_documents: boolean
}

export type MessageCreate = {
  role: "user"
  content: string
  use_documents: boolean
}

// Extended conversation type with properly typed messages
export interface ConversationWithMessages
  extends Omit<Conversation, "messages"> {
  messages: MessageChat[]
}

export interface ChatMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  use_documents: boolean
  created_at: string
}

export interface SendMessageParams {
  conversationId: string
  content: string
  useDocuments?: boolean
}

export interface CreateConversationParams {
  projectId?: string
  title: string
  useDocuments?: boolean
}

// Re-export Conversation as ChatConversation for consistency
export type { Conversation as ChatConversation } from "./types"
