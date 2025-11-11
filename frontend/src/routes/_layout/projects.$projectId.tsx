import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/projects/$projectId")({
  component: ProjectLayout,
})

function ProjectLayout() {
  return <Outlet />
}
