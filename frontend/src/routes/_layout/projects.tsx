import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/projects")({
  component: ProjectsLayout,
})

function ProjectsLayout() {
  return <Outlet />
}
