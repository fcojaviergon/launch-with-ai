import { Box, Container, Flex, Heading, Icon, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { FiCalendar, FiHome, FiPackage } from "react-icons/fi"
import { useTranslation } from "react-i18next"

import { useColorModeValue } from "@/components/ui/color-mode"
import { useAuth } from "@domains/auth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { t } = useTranslation()
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
            {t("dashboard:greeting", { name: currentUser?.full_name || currentUser?.email })} 👋🏼
          </Heading>
          <Text fontSize="lg" mb={8} color={textMuted}>
            {t("dashboard:welcomeMessage")}
          </Text>

          <Flex direction={{ base: "column", md: "row" }} gap={6} mt={6}>
            {/* Stat Cards */}
            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: cardHoverShadow,
              }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon as={FiHome} color="ui.primary" fontSize="xl" mr={2} />
                <Heading size="md" color={headingColor}>
                  {t("dashboard:quickOverview")}
                </Heading>
              </Flex>
              <Text color={textMuted}>
                {t("dashboard:quickOverviewText")}
              </Text>
            </Box>

            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: cardHoverShadow,
              }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon
                  as={FiPackage}
                  color="ui.secondary"
                  fontSize="xl"
                  mr={2}
                />
                <Heading size="md" color={headingColor}>
                  {t("dashboard:manageItems")}
                </Heading>
              </Flex>
              <Text color={textMuted}>
                {t("dashboard:manageItemsText")}
              </Text>
            </Box>

            <Box
              p={6}
              flex="1"
              bg={cardBg}
              boxShadow="md"
              borderRadius="xl"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: cardHoverShadow,
              }}
              transition="all 0.3s ease"
            >
              <Flex alignItems="center" mb={3}>
                <Icon as={FiCalendar} color="ui.accent" fontSize="xl" mr={2} />
                <Heading size="md" color={headingColor}>
                  {t("dashboard:recentActivity")}
                </Heading>
              </Flex>
              <Text color={textMuted}>
                {t("dashboard:recentActivityText")}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Container>
    </>
  )
}
