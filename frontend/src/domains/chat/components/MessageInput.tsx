import { Checkbox } from "@/components/ui/checkbox"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Box, Button, HStack, Textarea } from "@chakra-ui/react"
import { useState } from "react"
import { FaPaperPlane } from "react-icons/fa"

interface MessageInputProps {
  onSendMessage: (content: string, useDocuments: boolean) => void
  isLoading?: boolean
  placeholder?: string
  showUseDocuments?: boolean
}

export const MessageInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  showUseDocuments = true,
}: MessageInputProps) => {
  const [content, setContent] = useState("")
  const [useDocuments, setUseDocuments] = useState(true)

  // Theme-aware colors
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || isLoading) return

    onSendMessage(content.trim(), useDocuments)
    setContent("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderTopWidth="1px"
      borderColor={borderColor}
    >
      <HStack align="end" gap={2}>
        <Box flex={1}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            resize="none"
            rows={3}
            maxHeight="150px"
          />

          {showUseDocuments && (
            <Checkbox
              checked={useDocuments}
              onCheckedChange={(e) => setUseDocuments(!!e.checked)}
              disabled={isLoading}
              mt={2}
            >
              Use documents for context
            </Checkbox>
          )}
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          disabled={!content.trim() || isLoading}
          loading={isLoading}
          size="lg"
          px={6}
        >
          <FaPaperPlane />
        </Button>
      </HStack>
    </Box>
  )
}
