import { useColorModeValue } from "@/components/ui/color-mode"
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import { Box, Flex, Text } from "@chakra-ui/react"
import type { ProjectCapacity } from "../types/projects.types"

interface CapacityIndicatorProps {
  capacity: ProjectCapacity
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
}

export const CapacityIndicator = ({
  capacity,
  size = "md",
  showDetails = true,
}: CapacityIndicatorProps) => {
  // Theme-aware colors
  const textMuted = useColorModeValue("gray.600", "gray.400")

  const getColorScheme = () => {
    if (capacity.is_over_limit) return "red"
    if (capacity.is_near_limit) return "yellow"
    return "green"
  }

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toString()
  }

  const percentage = Math.min(capacity.usage_percentage, 100)
  const colorScheme = getColorScheme()

  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text fontSize={size === "sm" ? "xs" : "sm"} fontWeight="medium">
          Capacity Usage
        </Text>
        <Text
          fontSize={size === "sm" ? "xs" : "sm"}
          fontWeight="semibold"
          color={`${colorScheme}.600`}
        >
          {percentage.toFixed(1)}%
        </Text>
      </Flex>

      <ProgressRoot value={percentage} colorPalette={colorScheme} size={size}>
        <ProgressBar />
      </ProgressRoot>

      {showDetails && (
        <Flex justify="space-between" mt={2} fontSize="xs" color={textMuted}>
          <Text>
            {formatTokens(capacity.total_tokens)} /{" "}
            {formatTokens(capacity.max_tokens)} tokens
          </Text>
          <Text>{formatTokens(capacity.remaining_tokens)} remaining</Text>
        </Flex>
      )}

      {showDetails && (
        <Flex mt={2} gap={4} fontSize="xs" color={textMuted}>
          <Text>Documents: {formatTokens(capacity.documents_tokens)}</Text>
          <Text>
            Conversations: {formatTokens(capacity.conversations_tokens)}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
