import { Center, Flex, Spinner } from "@chakra-ui/react"
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { useCurrentUser } from "@domains/auth"
import { Navbar, Sidebar } from "@shared/components"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  const { data: user, isLoading, isError } = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      navigate({ to: "/login" })
    }
  }, [isLoading, isError, user, navigate])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  // Don't render layout if not authenticated
  if (isError || !user) {
    return null
  }

  return (
    <Flex direction="column" h="100vh">
      <Navbar />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Flex flex="1" direction="column" p={5} overflowY="auto">
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Layout
