"use client"

import { ChakraProvider } from "@chakra-ui/react"
import React, { type PropsWithChildren, useEffect, useState } from "react"
import { system } from "../../theme"
import type { ColorMode } from "./color-mode"
import { Toaster } from "./toaster"

// Create a context for color mode
const ColorModeContext = React.createContext({
  colorMode: "light" as ColorMode,
  setColorMode: (_mode: ColorMode) => {},
  resolvedTheme: "light" as "light" | "dark",
})

export const useColorModeContext = () => {
  const context = React.useContext(ColorModeContext)
  if (context === undefined) {
    throw new Error(
      "useColorModeContext must be used within a ColorModeProvider",
    )
  }
  return context
}

interface CustomProviderProps extends PropsWithChildren {
  useSystemTheme?: boolean
}

export function CustomProvider(props: CustomProviderProps) {
  const { useSystemTheme = false, children } = props
  const [colorMode, setColorMode] = useState<ColorMode>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Safe method to add theme class to HTML element
  const setThemeClass = (theme: "light" | "dark") => {
    try {
      document.documentElement.classList.remove("dark", "light")
      document.documentElement.classList.add(theme)
    } catch (error) {
      console.error("Error updating theme class:", error)
    }
  }

  // Handle system theme preference
  useEffect(() => {
    if (typeof window === "undefined") return

    setMounted(true)

    try {
      // Get stored theme
      const storedTheme =
        (localStorage.getItem("theme") as ColorMode) || "light"

      if (storedTheme !== "system") {
        setColorMode(storedTheme)
        setResolvedTheme(storedTheme)
        setThemeClass(storedTheme)
      } else {
        setColorMode("system")
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        setResolvedTheme(systemTheme)
        setThemeClass(systemTheme)
      }

      // Listen for system theme changes
      if (useSystemTheme || storedTheme === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        const handleChange = (e: MediaQueryListEvent) => {
          if (colorMode === "system") {
            const newTheme = e.matches ? "dark" : "light"
            setResolvedTheme(newTheme)
            setThemeClass(newTheme)
          }
        }

        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      }
    } catch (error) {
      console.error("Error in theme effect:", error)
    }
  }, [useSystemTheme, colorMode])

  // Handle theme changes
  const handleSetColorMode = (mode: ColorMode) => {
    try {
      if (mode === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        setThemeClass(systemTheme)
        setResolvedTheme(systemTheme)
      } else {
        setThemeClass(mode)
        setResolvedTheme(mode)
      }

      setColorMode(mode)
      localStorage.setItem("theme", mode)
    } catch (error) {
      console.error("Error setting color mode:", error)
    }
  }

  if (!mounted) {
    // Return minimal UI to avoid hydration mismatch
    return (
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    )
  }

  return (
    <ColorModeContext.Provider
      value={{
        colorMode,
        setColorMode: handleSetColorMode,
        resolvedTheme,
      }}
    >
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    </ColorModeContext.Provider>
  )
}
