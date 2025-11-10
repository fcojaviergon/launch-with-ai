import {
  Box,
  Button,
  EmptyState,
  Flex,
  Heading,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { FaCheck, FaEdit, FaPlus, FaTimes } from "react-icons/fa"
import { FiMessageSquare } from "react-icons/fi"
import { useCustomToast } from "@shared/hooks"
import {
  useConversations,
  useCreateConversation,
  useUpdateConversationTitle,
} from "@domains/chat"
import type { ChatConversation } from "@domains/chat"

interface ConversationListProps {
  projectId: string
}

interface ConversationItemProps {
  conversation: ChatConversation
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(conversation.title || "")
  const { showSuccessToast } = useCustomToast()
  const updateTitle = useUpdateConversationTitle()

  const handleSaveTitle = () => {
    updateTitle.mutate(
      { conversationId: conversation.id, title: editedTitle },
      {
        onSuccess: () => {
          showSuccessToast("Conversation title updated")
          setIsEditing(false)
        },
      }
    )
  }

  const handleCancelEdit = () => {
    setEditedTitle(conversation.title || "")
    setIsEditing(false)
  }

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      _hover={{ shadow: "md", borderColor: "blue.300" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center" gap={2}>
        {isEditing ? (
          <>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              size="sm"
              flex="1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle()
                if (e.key === "Escape") handleCancelEdit()
              }}
            />
            <IconButton
              aria-label="Save title"
              size="sm"
              colorPalette="green"
              variant="ghost"
              onClick={handleSaveTitle}
              disabled={updateTitle.isPending}
            >
              <FaCheck />
            </IconButton>
            <IconButton
              aria-label="Cancel edit"
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
            >
              <FaTimes />
            </IconButton>
          </>
        ) : (
          <>
            <Link
              to="/projects/$projectId/chat/$conversationId"
              params={{
                projectId: conversation.project_id!,
                conversationId: conversation.id,
              }}
              style={{ flex: 1 }}
            >
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1}>
                  {conversation.title || "New Conversation"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDistanceToNow(new Date(conversation.updated_at), {
                    addSuffix: true,
                  })}
                </Text>
              </Box>
            </Link>
            <IconButton
              aria-label="Edit title"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit />
            </IconButton>
          </>
        )}
      </Flex>
    </Box>
  )
}

export const ConversationList = ({ projectId }: ConversationListProps) => {
  const { data: conversations, isLoading } = useConversations(projectId)
  const createConversation = useCreateConversation()
  const { showSuccessToast } = useCustomToast()

  const handleCreateConversation = () => {
    createConversation.mutate(
      { projectId, title: "New Conversation" },
      {
        onSuccess: () => {
          showSuccessToast("Conversation created")
        },
      }
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Conversations</Heading>
        <Button
          size="sm"
          onClick={handleCreateConversation}
          disabled={createConversation.isPending}
        >
          <FaPlus /> New Chat
        </Button>
      </Flex>

      {isLoading && (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" />
        </Box>
      )}

      {!isLoading && conversations && conversations.length === 0 && (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiMessageSquare />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No conversations yet</EmptyState.Title>
              <EmptyState.Description>
                Start a new conversation to chat with AI about your documents
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      )}

      {!isLoading && conversations && conversations.length > 0 && (
        <VStack gap={2} align="stretch">
          {conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))}
        </VStack>
      )}
    </Box>
  )
}
