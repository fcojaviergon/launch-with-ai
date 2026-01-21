// Chat-related types - Re-exported from auto-generated OpenAPI client
// DO NOT duplicate types here - import from @/client/types.gen instead

// Re-export core chat types from OpenAPI
export type {
  ChatConversationCreate,
  ChatConversationPublic,
  ChatMessageCreate,
  ChatMessagePublic,
  DocumentReferenceBase,
  DocumentReferencePublic,
  Message,
} from "@/client/types.gen"

// Re-export request/response types from OpenAPI
export type {
  ChatGetUserConversationsResponse,
  ChatCreateConversationData,
  ChatCreateConversationResponse,
  ChatGetProjectConversationsData,
  ChatGetProjectConversationsResponse,
  ChatGetConversationData,
  ChatGetConversationResponse,
  ChatCreateMessageData,
  ChatCreateMessageResponse,
  ChatUpdateConversationTitleData,
  ChatUpdateConversationTitleResponse,
  ChatGenerateConversationTitleData,
  ChatGenerateConversationTitleResponse,
  ChatDeleteConversationData,
  ChatDeleteConversationResponse,
} from "@/client/types.gen"

// =============================================================================
// Type aliases for backward compatibility with existing code
// =============================================================================

/** @deprecated Use ChatConversationPublic from OpenAPI instead */
export type Conversation = import("@/client/types.gen").ChatConversationPublic

/** @deprecated Use ChatMessagePublic from OpenAPI instead */
export type MessageChat = import("@/client/types.gen").ChatMessagePublic

/** @deprecated Use DocumentReferencePublic from OpenAPI instead */
export type DocumentReference =
  import("@/client/types.gen").DocumentReferencePublic

// =============================================================================
// Legacy request types - kept for service layer compatibility
// =============================================================================

export type ChatGetConversationsData = {
  projectId: string
}

export type ChatGetConversationsResponse =
  import("@/client/types.gen").ChatConversationPublic[]

export type ChatUpdateTitleData = {
  conversationId: string
  title: string
}

export type ChatUpdateTitleResponse =
  import("@/client/types.gen").ChatConversationPublic

export type ChatSendMessageData = {
  conversationId: string
  requestBody: {
    role: string
    content: string
    use_documents?: boolean
  }
}

export type ChatSendMessageResponse =
  import("@/client/types.gen").ChatMessagePublic
