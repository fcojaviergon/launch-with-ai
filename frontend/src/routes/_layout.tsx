import { Box, Center, Flex, Spinner } from "@chakra-ui/react"
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { useColorModeValue } from "@/components/ui/color-mode"
import { useCurrentUser } from "@domains/auth"
import { Sidebar } from "@shared/components"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  const { data: user, isLoading, isError } = useCurrentUser()
  const navigate = useNavigate()

  // Theme-aware colors
  const bgColor = useColorModeValue("gray.50", "gray.950")
  const cardBg = useColorModeValue("white", "gray.900")
  const cardShadow = useColorModeValue(
    "0 1px 3px rgba(0,0,0,0.05)",
    "0 1px 3px rgba(0,0,0,0.3)"
  )

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      navigate({ to: "/login" })
    }
  }, [isLoading, isError, user, navigate])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Spinner size="xl" color="ui.primary" borderWidth="3px" />
      </Center>
    )
  }

  // Don't render layout if not authenticated
  if (isError || !user) {
    return null
  }

  return (
    <Flex h="100vh" bg={bgColor}>
      <Sidebar />
      <Box
        flex="1"
        overflowY="auto"
        p={{ base: 4, md: 6, lg: 8 }}
        ml={{ base: 0, md: 0 }}
      >
        <Box
          maxW="1600px"
          mx="auto"
          bg={cardBg}
          borderRadius="xl"
          minH="calc(100vh - 64px)"
          boxShadow={cardShadow}
          p={{ base: 4, md: 6 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout
