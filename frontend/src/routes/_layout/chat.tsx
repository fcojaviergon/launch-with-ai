import { Box } from "@chakra-ui/react"
import { ChatInterface } from "@domains/chat"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/chat")({
  component: Chat,
})

function Chat() {
  return (
    <Box height="100%" width="100%">
      <ChatInterface />
    </Box>
  )
}
