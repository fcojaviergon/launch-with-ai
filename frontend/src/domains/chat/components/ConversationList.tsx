import { Box, Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react"
import { FaComments, FaPlus } from "react-icons/fa"
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
  if (isLoading) {
    return (
      <VStack p={4} gap={4}>
        <Spinner size="lg" />
        <Text color="gray.500">Loading conversations...</Text>
      </VStack>
    )
  }

  if (error) {
    return (
      <VStack p={4} gap={4}>
        <Text color="red.500">Error loading conversations</Text>
        <Text fontSize="sm" color="gray.500">
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
        New Conversation
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
                selectedConversationId === conversation.id ? "blue.50" : "white"
              }
              borderColor={
                selectedConversationId === conversation.id
                  ? "blue.500"
                  : "gray.200"
              }
              _hover={{
                bg:
                  selectedConversationId === conversation.id
                    ? "blue.100"
                    : "gray.50",
              }}
              onClick={() => onSelectConversation(conversation)}
            >
              <HStack gap={3}>
                <Box color="blue.500">
                  <FaComments size={20} />
                </Box>
                <VStack align="start" gap={0} flex={1} minWidth={0}>
                  <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
                    {conversation.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <VStack p={8} gap={2}>
          <FaComments size={48} color="gray" />
          <Text color="gray.500" textAlign="center">
            No conversations yet
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            Click "New Conversation" to start
          </Text>
        </VStack>
      )}
    </VStack>
  )
}
