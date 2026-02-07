import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react"
import { FaComments, FaPlus } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import type { Conversation } from "../types/chat.types"

interface ConversationListProps {
  conversations?: Conversation[]
  isLoading?: boolean
  error?: Error | null
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onCreateConversation: () => void
}

export const ConversationList = ({
  conversations,
  isLoading,
  error,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
}: ConversationListProps) => {
  const { t } = useTranslation()

  // Theme-aware colors
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const textSubtle = useColorModeValue("gray.400", "gray.500")
  const cardBg = useColorModeValue("white", "gray.800")
  const cardHoverBg = useColorModeValue("gray.50", "gray.700")
  const selectedBg = useColorModeValue("blue.50", "blue.900")
  const selectedHoverBg = useColorModeValue("blue.100", "blue.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const selectedBorderColor = useColorModeValue("blue.500", "blue.400")
  const emptyIconColor = useColorModeValue("gray", "#4A5568")

  if (isLoading) {
    return (
      <VStack p={4} gap={4}>
        <Spinner size="lg" />
        <Text color={textMuted}>{t("chat:loadingConversations")}</Text>
      </VStack>
    )
  }

  if (error) {
    return (
      <VStack p={4} gap={4}>
        <Text color="red.500">{t("chat:errorLoadingConversations")}</Text>
        <Text fontSize="sm" color={textMuted}>
          {error.message}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" gap={2} height="100%" p={4}>
      <Button
        onClick={onCreateConversation}
        colorScheme="blue"
        size="md"
        width="100%"
      >
        <FaPlus />
        {t("chat:newConversation")}
      </Button>

      {conversations && conversations.length > 0 ? (
        <VStack align="stretch" gap={2} flex={1} overflowY="auto">
          {conversations.map((conversation) => (
            <Box
              key={conversation.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              bg={
                selectedConversationId === conversation.id ? selectedBg : cardBg
              }
              borderColor={
                selectedConversationId === conversation.id
                  ? selectedBorderColor
                  : borderColor
              }
              _hover={{
                bg:
                  selectedConversationId === conversation.id
                    ? selectedHoverBg
                    : cardHoverBg,
              }}
              onClick={() => onSelectConversation(conversation)}
              transition="all 0.2s"
            >
              <HStack gap={3}>
                <Box color="blue.500">
                  <FaComments size={20} />
                </Box>
                <VStack align="start" gap={0} flex={1} minWidth={0}>
                  <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
                    {conversation.title}
                  </Text>
                  <Text fontSize="xs" color={textMuted}>
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <VStack p={8} gap={2}>
          <FaComments size={48} color={emptyIconColor} />
          <Text color={textMuted} textAlign="center">
            {t("chat:noConversationsYet")}
          </Text>
          <Text fontSize="sm" color={textSubtle} textAlign="center">
            {t("chat:clickNewConversation")}
          </Text>
        </VStack>
      )}
    </VStack>
  )
}
