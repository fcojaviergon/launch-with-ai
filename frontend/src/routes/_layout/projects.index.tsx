import { ProjectList } from "@domains/projects"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/projects/")({
  component: ProjectsIndex,
})

function ProjectsIndex() {
  return <ProjectList />
}
