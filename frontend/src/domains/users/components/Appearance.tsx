import { useColorMode } from "@/components/ui/color-mode"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { useThemeColors } from "@/utils/theme-utils"
import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi"

export const Appearance = () => {
  const { t } = useTranslation()
  const { colorMode, resolvedTheme, setColorMode } = useColorMode()
  const colors = useThemeColors()
  const [mounted, setMounted] = useState(false)

  // Necessary to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Handle radio change
  const handleThemeChange = (details: { value: string | null }) => {
    if (details.value) {
      setColorMode(details.value as "light" | "dark" | "system")
    }
  }

  return (
    <Container maxW="full">
      <Heading size="sm" py={4}>
        {t("settings:appearance")}
      </Heading>

      <Text mb={4}>
        {t("settings:appearanceDescription")}
      </Text>

      <RadioGroup
        value={colorMode}
        onValueChange={handleThemeChange}
        colorPalette="teal"
      >
        <Stack gap={3}>
          <Box
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={
              colorMode === "system" ? colors.primary : colors.border
            }
            bg={colorMode === "system" ? colors.highlight : "transparent"}
          >
            <Radio value="system">
              <Flex align="center" gap={2}>
                <FiMonitor />
                <Box>
                  <Text fontWeight="medium">{t("settings:useSystemTheme")}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {t("settings:currentSystemTheme", { theme: resolvedTheme === "dark" ? t("settings:dark") : t("settings:light") })}
                  </Text>
                </Box>
              </Flex>
            </Radio>
          </Box>

          <Box
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={colorMode === "light" ? colors.primary : colors.border}
            bg={colorMode === "light" ? colors.highlight : "transparent"}
          >
            <Radio value="light">
              <Flex align="center" gap={2}>
                <FiSun />
                <Text fontWeight="medium">{t("settings:lightMode")}</Text>
              </Flex>
            </Radio>
          </Box>

          <Box
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={colorMode === "dark" ? colors.primary : colors.border}
            bg={colorMode === "dark" ? colors.highlight : "transparent"}
          >
            <Radio value="dark">
              <Flex align="center" gap={2}>
                <FiMoon />
                <Text fontWeight="medium">{t("settings:darkMode")}</Text>
              </Flex>
            </Radio>
          </Box>
        </Stack>
      </RadioGroup>
    </Container>
  )
}
