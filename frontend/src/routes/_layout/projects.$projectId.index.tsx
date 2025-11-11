import { createFileRoute } from "@tanstack/react-router"
import { ProjectView } from "@domains/projects"

export const Route = createFileRoute("/_layout/projects/$projectId/")({
  component: ProjectDetail,
})

function ProjectDetail() {
  const { projectId } = Route.useParams()
  return <ProjectView projectId={projectId} />
}
