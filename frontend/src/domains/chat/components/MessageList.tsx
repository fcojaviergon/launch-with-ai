import { useColorModeValue } from "@/components/ui/color-mode"
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react"
import { useEffect, useRef } from "react"
import { FaFileAlt, FaRobot, FaUser } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import type { MessageChat } from "../types/chat.types"

interface MessageListProps {
  messages: MessageChat[]
  isLoading?: boolean
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Theme-aware colors
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const textSubtle = useColorModeValue("gray.400", "gray.500")
  const assistantBg = useColorModeValue("gray.100", "gray.700")
  const assistantText = useColorModeValue("gray.900", "gray.100")
  const thinkingBg = useColorModeValue("gray.100", "gray.700")

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0 && !isLoading) {
    return (
      <VStack p={8} gap={2} justify="center" height="100%">
        <Text color={textMuted} textAlign="center">
          {t("chat:noMessagesYet")}
        </Text>
        <Text fontSize="sm" color={textSubtle} textAlign="center">
          {t("chat:startConversation")}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack
      align="stretch"
      gap={4}
      p={4}
      flex={1}
      overflowY="auto"
      height="100%"
    >
      {messages.map((message) => (
        <HStack
          key={message.id}
          align="start"
          gap={3}
          justify={message.role === "user" ? "flex-end" : "flex-start"}
        >
          {message.role === "assistant" && (
            <Box
              p={2}
              bg="blue.500"
              color="white"
              borderRadius="full"
              flexShrink={0}
            >
              <FaRobot />
            </Box>
          )}

          <VStack
            align={message.role === "user" ? "end" : "start"}
            gap={2}
            maxWidth="70%"
          >
            <Box
              bg={message.role === "user" ? "blue.500" : assistantBg}
              color={message.role === "user" ? "white" : assistantText}
              px={4}
              py={3}
              borderRadius="lg"
              borderTopRightRadius={message.role === "user" ? "none" : "lg"}
              borderTopLeftRadius={message.role === "assistant" ? "none" : "lg"}
            >
              <Text whiteSpace="pre-wrap">{message.content}</Text>
            </Box>

            {/* Document references */}
            {message.document_references &&
              message.document_references.length > 0 && (
                <HStack gap={2} flexWrap="wrap">
                  {message.document_references.map((ref) => (
                    <Badge
                      key={ref.id}
                      colorScheme="gray"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      <HStack gap={1}>
                        <FaFileAlt />
                        <Text>
                          {ref.filename} (p. {ref.page_number})
                        </Text>
                      </HStack>
                    </Badge>
                  ))}
                </HStack>
              )}

            <Text fontSize="xs" color={textMuted}>
              {new Date(message.created_at).toLocaleTimeString()}
            </Text>
          </VStack>

          {message.role === "user" && (
            <Box
              p={2}
              bg="blue.500"
              color="white"
              borderRadius="full"
              flexShrink={0}
            >
              <FaUser />
            </Box>
          )}
        </HStack>
      ))}

      {isLoading && (
        <HStack align="start" gap={3}>
          <Box
            p={2}
            bg="blue.500"
            color="white"
            borderRadius="full"
            flexShrink={0}
          >
            <FaRobot />
          </Box>
          <Box bg={thinkingBg} px={4} py={3} borderRadius="lg">
            <HStack gap={2}>
              <Text color={assistantText}>{t("chat:thinking")}</Text>
              <Box as="span" animation="pulse 1.5s ease-in-out infinite">
                ...
              </Box>
            </HStack>
          </Box>
        </HStack>
      )}

      <div ref={messagesEndRef} />
    </VStack>
  )
}
