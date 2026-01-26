import { Box, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { useColorModeValue } from "@/components/ui/color-mode"
import { Sidebar } from "@shared/components"
import { UsersService } from "@domains/users"

export const Route = createFileRoute("/_layout")({
  // Auth guard - runs BEFORE component renders (no loading spinner)
  beforeLoad: async ({ context }) => {
    // Try to get cached user first, otherwise fetch
    let user = context.queryClient.getQueryData(["currentUser"])

    if (!user) {
      try {
        user = await context.queryClient.fetchQuery({
          queryKey: ["currentUser"],
          queryFn: UsersService.readUserMe,
          staleTime: 5 * 60 * 1000,
        })
      } catch {
        // Not authenticated - redirect to login
        throw redirect({ to: "/login" })
      }
    }

    if (!user) {
      throw redirect({ to: "/login" })
    }

    return { user }
  },
  component: Layout,
})

function Layout() {
  // Theme-aware colors
  const bgColor = useColorModeValue("gray.50", "gray.950")
  const cardBg = useColorModeValue("white", "gray.900")
  const cardShadow = useColorModeValue(
    "0 1px 3px rgba(0,0,0,0.05)",
    "0 1px 3px rgba(0,0,0,0.3)"
  )

  // User is guaranteed to be authenticated at this point (beforeLoad ensures it)
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
