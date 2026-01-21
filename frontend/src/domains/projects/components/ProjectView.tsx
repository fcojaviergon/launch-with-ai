import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react"
import { useProject, useProjectCapacity } from "../api/projects.api"
import { CapacityIndicator } from "./CapacityIndicator"
import { ConversationList } from "./ConversationList"
import { DeleteProject } from "./DeleteProject"
import { DocumentList } from "./DocumentList"
import { EditProject } from "./EditProject"

interface ProjectViewProps {
  projectId: string
}

export const ProjectView = ({ projectId }: ProjectViewProps) => {
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: capacity, isLoading: capacityLoading } =
    useProjectCapacity(projectId)

  if (projectLoading) {
    return (
      <Container maxW="full">
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  if (!project) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Project not found
        </Heading>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      {/* Project Header */}
      <Box pt={12} pb={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <Box flex="1">
            <Heading size="lg" mb={2}>
              {project.name}
            </Heading>
            {project.description && (
              <Text color="gray.600" fontSize="md">
                {project.description}
              </Text>
            )}
          </Box>
          <Flex gap={2}>
            <EditProject project={project} />
            <DeleteProject project={project} />
          </Flex>
        </Flex>

        {/* Capacity Indicator */}
        {capacity && !capacityLoading && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" mb={6}>
            <CapacityIndicator
              capacity={capacity}
              size="md"
              showDetails={true}
            />
          </Box>
        )}

        {/* System Prompt */}
        {project.system_prompt && (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg="blue.50"
            borderColor="blue.200"
            mb={6}
          >
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.700">
              System Prompt
            </Text>
            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
              {project.system_prompt}
            </Text>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} pb={8}>
        {/* Left Column - Conversations */}
        <Box>
          <ConversationList projectId={projectId} />
        </Box>

        {/* Right Column - Documents */}
        <Box>
          <DocumentList projectId={projectId} />
        </Box>
      </Grid>
    </Container>
  )
}
