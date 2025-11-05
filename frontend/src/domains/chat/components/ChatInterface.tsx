import { Box, Grid, GridItem, Heading, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { ConversationList } from "./ConversationList"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import {
  useConversations,
  useCreateConversation,
  useSendMessage,
} from "../api/chat.api"
import type { Conversation, MessageChat } from "../types/chat.types"
import { useCustomToast } from "@shared/hooks"

interface ChatInterfaceProps {
  analysisId: string
  analysisTitle?: string
}

export const ChatInterface = ({
  analysisId,
  analysisTitle,
}: ChatInterfaceProps) => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data: conversations } = useConversations(analysisId)
  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()

  const handleCreateConversation = () => {
    setIsCreatingConversation(true)
    const title = `Conversation ${(conversations?.length || 0) + 1}`

    createConversation.mutate(
      {
        analysis_id: analysisId,
        title,
        use_documents: true,
      },
      {
        onSuccess: (newConversation) => {
          setSelectedConversation(newConversation)
          setIsCreatingConversation(false)
          showSuccessToast("Conversation created successfully")
        },
        onError: (error) => {
          setIsCreatingConversation(false)
          showErrorToast("Failed to create conversation: " + error.message)
        },
      },
    )
  }

  const handleSendMessage = (content: string, useDocuments: boolean) => {
    if (!selectedConversation) return

    sendMessage.mutate(
      {
        conversationId: selectedConversation.id,
        message: {
          role: "user" as const,
          content,
          use_documents: useDocuments,
        },
      },
      {
        onSuccess: () => {
          // Messages will be refreshed by query invalidation
        },
        onError: (error) => {
          showErrorToast("Failed to send message: " + error.message)
        },
      },
    )
  }

  // Get messages for selected conversation
  const selectedMessages =
    (selectedConversation?.messages as MessageChat[]) || []

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottomWidth="1px" borderColor="gray.200">
        <Heading size="md">Chat</Heading>
        {analysisTitle && (
          <Text fontSize="sm" color="gray.500">
            {analysisTitle}
          </Text>
        )}
      </Box>

      {/* Main content */}
      <Grid templateColumns="300px 1fr" flex={1} overflow="hidden">
        {/* Sidebar - Conversation List */}
        <GridItem
          borderRightWidth="1px"
          borderColor="gray.200"
          overflowY="auto"
        >
          <ConversationList
            analysisId={analysisId}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
            onCreateConversation={handleCreateConversation}
          />
        </GridItem>

        {/* Main chat area */}
        <GridItem display="flex" flexDirection="column" overflow="hidden">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <Box flex={1} overflowY="auto">
                <MessageList
                  messages={selectedMessages}
                  isLoading={sendMessage.isPending}
                />
              </Box>

              {/* Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={sendMessage.isPending}
              />
            </>
          ) : (
            <VStack justify="center" height="100%" gap={4} p={8}>
              <Text fontSize="lg" color="gray.500">
                Select a conversation or create a new one to start chatting
              </Text>
            </VStack>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}
