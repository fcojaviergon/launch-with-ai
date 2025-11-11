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
   * Get all conversations for the current user
   * @returns Conversation[] Successful Response
   * @throws ApiError
   */
  public static getUserConversations(): CancelablePromise<ChatGetConversationsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/chat/conversations",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get conversations for a project
   * @param data The data for the request.
   * @param data.projectId
   * @returns Conversation[] Successful Response
   * @throws ApiError
   */
  public static getConversations(
    data: ChatGetConversationsData,
  ): CancelablePromise<ChatGetConversationsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/chat/conversations/{project_id}",
      path: {
        project_id: data.projectId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update conversation title
   * @param data The data for the request.
   * @param data.conversationId
   * @param data.title
   * @returns Conversation Successful Response
   * @throws ApiError
   */
  public static updateConversationTitle(
    data: import("../types").ChatUpdateTitleData,
  ): CancelablePromise<import("../types").ChatUpdateTitleResponse> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/chat/conversations/{conversation_id}/title",
      path: {
        conversation_id: data.conversationId,
      },
      query: {
        title: data.title,
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
