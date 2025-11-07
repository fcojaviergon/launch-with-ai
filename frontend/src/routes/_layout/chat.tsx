import { Box } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { ChatInterface } from "@domains/chat"

export const Route = createFileRoute("/_layout/chat")({
  component: Chat,
})

function Chat() {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      margin="-20px"
    >
      <ChatInterface />
    </Box>
  )
}
