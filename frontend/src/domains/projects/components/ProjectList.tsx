import {
  Container,
  EmptyState,
  Flex,
  Grid,
  Heading,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import { FiFolder } from "react-icons/fi"
import { useProjects } from "../api/projects.api"
import { AddProject } from "./AddProject"
import { ProjectCard } from "./ProjectCard"

export const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Projects
        </Heading>
        <AddProject />
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Projects
        </Heading>
        <AddProject />
        <EmptyState.Root>
          <EmptyState.Content>
            <VStack textAlign="center">
              <EmptyState.Title>Error loading projects</EmptyState.Title>
              <EmptyState.Description>
                {error.message || "Something went wrong"}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Container>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Projects
        </Heading>
        <AddProject />
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiFolder />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No projects yet</EmptyState.Title>
              <EmptyState.Description>
                Create your first project to organize documents and conversations
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Container>
    )
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Projects
      </Heading>
      <AddProject />
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={6}
        mt={4}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Grid>
    </Container>
  )
}
