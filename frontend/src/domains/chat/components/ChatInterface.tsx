import { useColorModeValue } from "@/components/ui/color-mode"
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useCustomToast } from "@shared/hooks"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FaArrowLeft, FaComments } from "react-icons/fa"
import {
  useConversations,
  useCreateConversation,
  useSendMessage,
  useUserConversations,
} from "../api/chat.api"
import type { Conversation, MessageChat } from "../types/chat.types"
import { ConversationList } from "./ConversationList"
import { MessageInput } from "./MessageInput"
import { MessageList } from "./MessageList"

interface ChatInterfaceProps {
  analysisId?: string
  analysisTitle?: string
  projectId?: string
  projectName?: string
  selectedConversationId?: string
}

export const ChatInterface = ({
  analysisId,
  analysisTitle,
  projectId,
  projectName,
  selectedConversationId,
}: ChatInterfaceProps) => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)

  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Theme-aware colors
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const inputBg = useColorModeValue("gray.50", "gray.900")
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const emptyIconColor = useColorModeValue("#CBD5E0", "#4A5568")
  const backButtonHoverBg = useColorModeValue("gray.100", "gray.700")

  // Determine which ID to use (projectId takes precedence for new code)
  const contextId = projectId || analysisId

  // Use either user conversations or project/analysis-specific conversations
  const {
    data: userConversations,
    isLoading: isLoadingUser,
    error: errorUser,
  } = useUserConversations()
  const {
    data: contextConversations,
    isLoading: isLoadingContext,
    error: errorContext,
  } = useConversations(contextId)

  const conversations = contextId ? contextConversations : userConversations
  const isLoading = contextId ? isLoadingContext : isLoadingUser
  const error = contextId ? errorContext : errorUser

  // Auto-select conversation if selectedConversationId is provided
  useEffect(() => {
    if (selectedConversationId && conversations) {
      const conversation = conversations.find(
        (c) => c.id === selectedConversationId,
      )
      if (conversation) {
        setSelectedConversation(conversation)
      }
    }
  }, [selectedConversationId, conversations])

  // Update selected conversation when conversations data changes (e.g., after sending a message)
  useEffect(() => {
    if (selectedConversation && conversations) {
      const updatedConversation = conversations.find(
        (c) => c.id === selectedConversation.id,
      )
      if (updatedConversation) {
        setSelectedConversation(updatedConversation)
      }
    }
  }, [conversations, selectedConversation?.id])

  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()

  const handleCreateConversation = () => {
    const title = `Conversation ${(conversations?.length || 0) + 1}`

    createConversation.mutate(
      {
        project_id: projectId || analysisId,
        title,
        use_documents: !!projectId, // Enable documents for project conversations
      },
      {
        onSuccess: (newConversation) => {
          setSelectedConversation(newConversation)
          showSuccessToast("Conversation created successfully")
        },
        onError: (error) => {
          showErrorToast(`Failed to create conversation: ${error.message}`)
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
          showErrorToast(`Failed to send message: ${error.message}`)
        },
      },
    )
  }

  // Get messages for selected conversation
  const selectedMessages = selectedConversation?.messages
    ? (selectedConversation.messages as unknown as MessageChat[])
    : []

  return (
    <Box height="100%" display="flex" flexDirection="column" bg={bgColor}>
      {/* Header */}
      <Box
        p={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
        flexShrink={0}
        bg={cardBg}
      >
        <Flex align="center" gap={3}>
          {/* Back button for project context */}
          {projectId && (
            <Link to="/projects/$projectId" params={{ projectId }}>
              <IconButton
                aria-label="Back to project"
                variant="ghost"
                size="sm"
                _hover={{ bg: backButtonHoverBg }}
              >
                <FaArrowLeft />
              </IconButton>
            </Link>
          )}
          <Box>
            <Flex align="center" gap={2}>
              {projectId && projectName && (
                <>
                  <Link to="/projects/$projectId" params={{ projectId }}>
                    <Text
                      fontSize="sm"
                      color={textMuted}
                      _hover={{
                        textDecoration: "underline",
                        color: "blue.500",
                      }}
                      cursor="pointer"
                    >
                      {projectName}
                    </Text>
                  </Link>
                  <Text color={textMuted} fontSize="sm">
                    /
                  </Text>
                </>
              )}
              <Heading size="md">Chat</Heading>
            </Flex>
            {analysisTitle && (
              <Text fontSize="sm" color={textMuted} mt={1}>
                {analysisTitle}
              </Text>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Main content */}
      <Grid templateColumns="350px 1fr" flex={1} overflow="hidden" gap={0}>
        {/* Sidebar - Conversation List */}
        <GridItem
          borderRightWidth="1px"
          borderColor={borderColor}
          overflowY="auto"
          bg={cardBg}
        >
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            error={error}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
            onCreateConversation={handleCreateConversation}
          />
        </GridItem>

        {/* Main chat area */}
        <GridItem
          display="flex"
          flexDirection="column"
          overflow="hidden"
          bg={cardBg}
        >
          {selectedConversation ? (
            <>
              {/* Messages */}
              <Box flex={1} overflowY="auto" p={4}>
                <MessageList
                  messages={selectedMessages}
                  isLoading={sendMessage.isPending}
                />
              </Box>

              {/* Input */}
              <Box
                borderTopWidth="1px"
                borderColor={borderColor}
                p={4}
                bg={inputBg}
              >
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={sendMessage.isPending}
                />
              </Box>
            </>
          ) : (
            <VStack justify="center" height="100%" gap={4} p={8}>
              <FaComments size={64} color={emptyIconColor} />
              <Text fontSize="lg" color={textMuted} textAlign="center">
                Select a conversation or create a new one to start chatting
              </Text>
            </VStack>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}
