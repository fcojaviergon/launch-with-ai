import { Avatar as ChakraAvatar } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface AvatarProps {
  name?: string
  src?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const { name, src, size = "md" } = props

    return (
      <ChakraAvatar.Root ref={ref} size={size}>
        <ChakraAvatar.Image src={src} alt={name} />
        <ChakraAvatar.Fallback>{getInitials(name)}</ChakraAvatar.Fallback>
      </ChakraAvatar.Root>
    )
  },
)

function getInitials(name?: string): string {
  if (!name) return "U"

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
