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
import { useTranslation } from "react-i18next"
import { FiFolder, FiSearch } from "react-icons/fi"
import { useProjects } from "../api/projects.api"
import { AddProject } from "./AddProject"
import { ProjectCard } from "./ProjectCard"

export const ProjectList = () => {
  const { t } = useTranslation()
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
          {t("projects:projects")}
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
          {t("projects:projects")}
        </Heading>
        <AddProject />
        <EmptyState.Root>
          <EmptyState.Content>
            <VStack textAlign="center">
              <EmptyState.Title>{t("projects:errorLoadingProjects")}</EmptyState.Title>
              <EmptyState.Description>
                {error.message || t("projects:somethingWentWrong")}
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
        {t("projects:projects")}
      </Heading>
      <AddProject />
      <InputGroup
        startElement={<FiSearch />}
        width={{ base: "100%", md: "sm" }}
      >
        <Input
          placeholder={t("projects:searchPlaceholder")}
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
                  ? t("projects:noProjectsSearch")
                  : t("projects:noProjectsYet")}
              </EmptyState.Title>
              <EmptyState.Description>
                {debouncedSearch
                  ? t("projects:adjustSearch")
                  : t("projects:createFirstProject")}
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
