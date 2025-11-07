import { ChatService } from "@domains/chat"
import type { Conversation, MessageChat } from "@domains/chat"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ConversationCreate, MessageCreate } from "../types/chat.types"

/**
 * Hook to fetch all conversations for the current user
 */
export const useUserConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: ["chat", "user-conversations"],
    queryFn: async () => {
      return ChatService.getUserConversations()
    },
  })
}

/**
 * Hook to fetch conversations for an analysis
 */
export const useConversations = (analysisId: string | undefined) => {
  return useQuery<Conversation[]>({
    queryKey: ["chat", "conversations", analysisId],
    queryFn: async () => {
      if (!analysisId) return []
      return ChatService.getConversations({ analysisId })
    },
    enabled: !!analysisId,
  })
}

/**
 * Hook to create a new conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation<Conversation, Error, ConversationCreate>({
    mutationFn: (data) => ChatService.createConversation({ requestBody: data }),
    onSuccess: (_, variables) => {
      // Invalidate both user conversations and specific analysis conversations
      queryClient.invalidateQueries({
        queryKey: ["chat", "user-conversations"],
      })
      if (variables.analysis_id) {
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversations", variables.analysis_id],
        })
      }
    },
  })
}

/**
 * Hook to send a message in a conversation
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<
    MessageChat,
    Error,
    { conversationId: string; message: MessageCreate }
  >({
    mutationFn: ({ conversationId, message }) =>
      ChatService.sendMessage({
        conversationId,
        requestBody: message,
      }),
    onSuccess: () => {
      // Invalidate conversations to refresh messages
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      })
    },
  })
}

/**
 * Hook to delete a conversation
 * TODO: Implement when deleteConversation endpoint is added to backend
 */
export const useDeleteConversation = () => {
  return {
    mutate: (_conversationId: string) => {
      console.warn("Delete conversation not yet implemented in backend")
    },
    mutateAsync: async (_conversationId: string) => {
      console.warn("Delete conversation not yet implemented in backend")
    },
    isPending: false,
  }
}
