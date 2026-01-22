import { Box, Flex, Spinner } from "@chakra-ui/react"
import { ChatInterface } from "@domains/chat"
import { useProject } from "@domains/projects"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_layout/projects/$projectId/chat/$conversationId",
)({
  component: ProjectChat,
})

function ProjectChat() {
  const { projectId, conversationId } = Route.useParams()
  const { data: project, isLoading } = useProject(projectId)

  if (isLoading) {
    return (
      <Flex height="100%" width="100%" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <Box height="100%" width="100%">
      <ChatInterface
        projectId={projectId}
        projectName={project?.name}
        selectedConversationId={conversationId}
      />
    </Box>
  )
}
