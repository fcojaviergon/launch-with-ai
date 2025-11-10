// Chat-related types - auto-generated from OpenAPI spec

export interface DocumentReference {
  id: string
  message_id: string
  document_id: string
  document_type: string
  filename: string
  relevance_score: number
  created_at: string
  page_number: number
  page_total: number
}

export interface MessageChat {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  use_documents: boolean
  created_at: string
  document_references?: DocumentReference[]
}

export interface Conversation {
  id: string
  user_id: string
  project_id: string | null
  title: string
  use_documents: boolean
  auto_generated_title: boolean
  title_generation_task_id: string | null
  created_at: string
  updated_at: string
  messages: import("@/client").Message[]
}

// Request/Response types
export type ChatGetConversationsData = {
  projectId: string
}

export type ChatGetConversationsResponse = Conversation[]

export type ChatCreateConversationData = {
  requestBody: {
    project_id?: string
    title: string
    use_documents: boolean
  }
}

export type ChatUpdateTitleData = {
  conversationId: string
  title: string
}

export type ChatUpdateTitleResponse = Conversation

export type ChatCreateConversationResponse = Conversation

export type ChatSendMessageData = {
  conversationId: string
  requestBody: {
    role: "user"
    content: string
    use_documents: boolean
  }
}

export type ChatSendMessageResponse = MessageChat
