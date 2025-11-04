// Chat service - auto-generated from OpenAPI spec
import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import type {
  ChatCreateConversationData,
  ChatCreateConversationResponse,
  ChatGetConversationsData,
  ChatGetConversationsResponse,
  ChatSendMessageData,
  ChatSendMessageResponse,
} from "../types"

export class ChatService {
  /**
   * Get conversations for an analysis
   * @param data The data for the request.
   * @param data.analysisId
   * @returns Conversation[] Successful Response
   * @throws ApiError
   */
  public static getConversations(
    data: ChatGetConversationsData,
  ): CancelablePromise<ChatGetConversationsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/chat/conversations/{analysis_id}",
      path: {
        analysis_id: data.analysisId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create a new conversation
   * @param data The data for the request.
   * @param data.requestBody
   * @returns Conversation Successful Response
   * @throws ApiError
   */
  public static createConversation(
    data: ChatCreateConversationData,
  ): CancelablePromise<ChatCreateConversationResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/chat/conversations",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Send a message to a conversation
   * @param data The data for the request.
   * @param data.conversationId
   * @param data.requestBody
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static sendMessage(
    data: ChatSendMessageData,
  ): CancelablePromise<ChatSendMessageResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/chat/conversations/{conversation_id}/messages",
      path: {
        conversation_id: data.conversationId,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}
