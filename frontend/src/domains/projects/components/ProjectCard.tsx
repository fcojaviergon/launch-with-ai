import { Badge, Box, Card, Flex, Heading, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import type { Project } from "../types/projects.types"
import { useProjectCapacity } from "../api/projects.api"
import { CapacityIndicator } from "./CapacityIndicator"

interface ProjectCardProps {
  project: Project
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { data: capacity } = useProjectCapacity(project.id)

  return (
    <Link to="/projects/$projectId" params={{ projectId: project.id }}>
      <Card.Root
        _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
        transition="all 0.2s"
        cursor="pointer"
        h="100%"
      >
        <Card.Header>
          <Flex justify="space-between" align="start">
            <Box flex="1">
              <Heading size="md" mb={2}>
                {project.name}
              </Heading>
              {project.description && (
                <Text fontSize="sm" color="gray.600" lineClamp={2}>
                  {project.description}
                </Text>
              )}
            </Box>
          </Flex>
        </Card.Header>

        <Card.Body>
          {capacity && (
            <Box mb={4}>
              <CapacityIndicator capacity={capacity} size="sm" showDetails={false} />
            </Box>
          )}

          <Flex gap={2} flexWrap="wrap">
            <Badge colorPalette="blue" variant="subtle">
              {project.documents?.length || 0} documents
            </Badge>
          </Flex>
        </Card.Body>

        <Card.Footer>
          <Text fontSize="xs" color="gray.500">
            Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </Text>
        </Card.Footer>
      </Card.Root>
    </Link>
  )
}
