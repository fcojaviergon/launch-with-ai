import { createFileRoute } from "@tanstack/react-router"
import { ProjectList } from "@domains/projects"

export const Route = createFileRoute("/_layout/projects/")({
  component: ProjectsIndex,
})

function ProjectsIndex() {
  return <ProjectList />
}
