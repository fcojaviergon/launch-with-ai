import { Box } from "@chakra-ui/react"
import { ChatInterface } from "@domains/chat"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_layout/projects/$projectId/chat/$conversationId",
)({
  component: ProjectChat,
})

function ProjectChat() {
  const { projectId, conversationId } = Route.useParams()

  return (
    <Box height="100%" width="100%">
      <ChatInterface
        projectId={projectId}
        selectedConversationId={conversationId}
      />
    </Box>
  )
}
