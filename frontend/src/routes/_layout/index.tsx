import { Box, Container, Flex, Heading, Icon, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { FiCalendar, FiHome, FiPackage } from "react-icons/fi"

import { useColorModeValue } from "@/components/ui/color-mode"
import { useAuth } from "@domains/auth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  // Theme-aware colors
  const cardBg = useColorModeValue("white", "gray.800")
  const cardHoverShadow = useColorModeValue("lg", "dark-lg")
  const textMuted = useColorModeValue("gray.600", "gray.400")
  const headingColor = useColorModeValue("gray.800", "gray.100")

  return (
    <>
      <Container maxW="full">
        <Box py={8} px={2}>
          <Heading
            as="h1"
            size="xl"
            fontWeight="bold"
            mb={6}
            color="ui.primary"
          >
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Heading>
          <Text fontSize="lg" mb={8} color={textMuted}>
            Welcome back, nice to see you again!
          </Text>

          <Flex direction={{ base: "column", md: "row" }} gap={6} mt={6}>
            {/* Stat Cards */}
            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{ transform: "translateY(-4px)", boxShadow: cardHoverShadow }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon as={FiHome} color="ui.primary" fontSize="xl" mr={2} />
                <Heading size="md" color={headingColor}>Quick Overview</Heading>
              </Flex>
              <Text color={textMuted}>
                Access all your items and analytics from this dashboard.
              </Text>
            </Box>

            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{ transform: "translateY(-4px)", boxShadow: cardHoverShadow }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon
                  as={FiPackage}
                  color="ui.secondary"
                  fontSize="xl"
                  mr={2}
                />
                <Heading size="md" color={headingColor}>Manage Items</Heading>
              </Flex>
              <Text color={textMuted}>
                Create, edit and manage all your items efficiently.
              </Text>
            </Box>

            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{ transform: "translateY(-4px)", boxShadow: cardHoverShadow }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon as={FiCalendar} color="ui.accent" fontSize="xl" mr={2} />
                <Heading size="md" color={headingColor}>Recent Activity</Heading>
              </Flex>
              <Text color={textMuted}>
                View and track your recent activities and changes.
              </Text>
            </Box>
          </Flex>
        </Box>
      </Container>
    </>
  )
}
