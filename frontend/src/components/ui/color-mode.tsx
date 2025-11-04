"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react"
import * as React from "react"
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu"
import { useColorModeContext } from "./provider"

export type ColorMode = "light" | "dark" | "system"

export interface UseColorModeReturn {
  colorMode: ColorMode
  resolvedTheme: "light" | "dark"
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { colorMode, setColorMode, resolvedTheme } = useColorModeContext()

  const toggleColorMode = React.useCallback(() => {
    setColorMode(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setColorMode])

  return {
    colorMode,
    resolvedTheme,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { resolvedTheme } = useColorMode()
  return resolvedTheme === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode, resolvedTheme } = useColorMode()

  if (colorMode === "system") {
    return <LuMonitor />
  }

  return resolvedTheme === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)
