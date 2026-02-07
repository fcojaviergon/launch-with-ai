import { InputGroup } from "@/components/ui/input-group"
import {
  Container,
  EmptyState,
  Flex,
  Grid,
  Heading,
  Input,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FiFolder, FiSearch } from "react-icons/fi"
import { useProjects } from "../api/projects.api"
import { AddProject } from "./AddProject"
import { ProjectCard } from "./ProjectCard"

export const ProjectList = () => {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: projects,
    isLoading,
    error,
  } = useProjects(debouncedSearch || undefined)

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

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Projects
      </Heading>
      <AddProject />
      <InputGroup
        startElement={<FiSearch />}
        width={{ base: "100%", md: "sm" }}
      >
        <Input
          placeholder="Search by name or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="sm"
        />
      </InputGroup>

      {!projects || projects.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiFolder />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {debouncedSearch
                  ? "No projects match your search"
                  : "No projects yet"}
              </EmptyState.Title>
              <EmptyState.Description>
                {debouncedSearch
                  ? "Try adjusting your search terms"
                  : "Create your first project to organize documents and conversations"}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
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
      )}
    </Container>
  )
}
