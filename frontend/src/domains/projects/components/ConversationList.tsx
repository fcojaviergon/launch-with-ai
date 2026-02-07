import { useColorModeValue } from "@/components/ui/color-mode"
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
import {
  useConversations,
  useCreateConversation,
  useUpdateConversationTitle,
} from "@domains/chat"
import type { ChatConversation } from "@domains/chat"
import { useCustomToast } from "@shared/hooks"
import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaCheck, FaEdit, FaPlus, FaTimes } from "react-icons/fa"
import { FiMessageSquare } from "react-icons/fi"

interface ConversationListProps {
  projectId: string
}

interface ConversationItemProps {
  conversation: ChatConversation
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(conversation.title || "")
  const { showSuccessToast } = useCustomToast()
  const updateTitle = useUpdateConversationTitle()

  // Theme-aware colors
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const hoverBorderColor = useColorModeValue("blue.300", "blue.500")

  const handleSaveTitle = () => {
    updateTitle.mutate(
      { conversationId: conversation.id, title: editedTitle },
      {
        onSuccess: () => {
          showSuccessToast(t("chat:conversationTitleUpdated"))
          setIsEditing(false)
        },
      },
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
      _hover={{ shadow: "md", borderColor: hoverBorderColor }}
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
              aria-label={t("projects:saveTitle")}
              size="sm"
              colorPalette="green"
              variant="ghost"
              onClick={handleSaveTitle}
              disabled={updateTitle.isPending}
            >
              <FaCheck />
            </IconButton>
            <IconButton
              aria-label={t("projects:cancelEdit")}
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
                  {conversation.title || t("projects:newConversationTitle")}
                </Text>
                <Text fontSize="xs" color={textMuted}>
                  {formatDistanceToNow(new Date(conversation.updated_at), {
                    addSuffix: true,
                  })}
                </Text>
              </Box>
            </Link>
            <IconButton
              aria-label={t("projects:editTitle")}
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
  const { t } = useTranslation()
  const { data: conversations, isLoading } = useConversations(projectId)
  const createConversation = useCreateConversation()
  const { showSuccessToast } = useCustomToast()

  const handleCreateConversation = () => {
    createConversation.mutate(
      { project_id: projectId, title: "New Conversation", use_documents: true },
      {
        onSuccess: () => {
          showSuccessToast(t("chat:conversationCreated"))
        },
      },
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">{t("projects:conversations")}</Heading>
        <Button
          size="sm"
          onClick={handleCreateConversation}
          disabled={createConversation.isPending}
        >
          <FaPlus /> {t("projects:newChat")}
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
              <EmptyState.Title>{t("projects:noConversationsYet")}</EmptyState.Title>
              <EmptyState.Description>
                {t("projects:startNewConversation")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      )}

      {!isLoading && conversations && conversations.length > 0 && (
        <VStack gap={2} align="stretch">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}
