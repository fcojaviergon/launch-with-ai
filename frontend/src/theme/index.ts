import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./button.recipe"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      fontSize: "16px",
    },
    body: {
      fontSize: "1rem",
      margin: 0,
      padding: 0,
    },
    ".main-link": {
      color: "ui.main",
      fontWeight: "bold",
    },
    "*": {
      boxSizing: "border-box",
    },
    "::selection": {
      background: "rgba(79, 70, 229, 0.2)",
      color: "#1e1b4b",
    },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          // Primary - Indigo palette for a modern, professional look
          main: { value: "#4F46E5" },
          primary: { value: "#4F46E5" },
          secondary: { value: "#6366F1" },
          accent: { value: "#818CF8" },

          // Background colors
          background: {
            light: { value: "#F8FAFC" },
            dark: { value: "#0F172A" },
          },
          card: {
            light: { value: "#FFFFFF" },
            dark: { value: "#1E293B" },
          },
          text: {
            light: { value: "#1E293B" },
            dark: { value: "#F1F5F9" },
          },

          // Semantic colors - refined palette
          success: { value: "#059669" },
          warning: { value: "#D97706" },
          error: { value: "#DC2626" },
          info: { value: "#0284C7" },

          // Surface and borders
          surface: {
            light: { value: "#F1F5F9" },
            dark: { value: "#1E293B" },
          },
          border: {
            light: { value: "#E2E8F0" },
            dark: { value: "#334155" },
          },

          // Shadows and highlights
          shadow: {
            light: { value: "rgba(15, 23, 42, 0.08)" },
            dark: { value: "rgba(0, 0, 0, 0.4)" },
          },
          highlight: {
            light: { value: "#EEF2FF" },
            dark: { value: "#312E81" },
          },
        },
      },
      fontSizes: {
        xs: { value: "0.75rem" },
        sm: { value: "0.875rem" },
        md: { value: "1rem" },
        lg: { value: "1.125rem" },
        xl: { value: "1.25rem" },
        "2xl": { value: "1.5rem" },
        "3xl": { value: "1.875rem" },
        "4xl": { value: "2.25rem" },
        "5xl": { value: "3rem" },
      },
      radii: {
        sm: { value: "0.375rem" },
        md: { value: "0.5rem" },
        lg: { value: "0.75rem" },
        xl: { value: "1rem" },
        "2xl": { value: "1.5rem" },
        full: { value: "9999px" },
      },
      shadows: {
        sm: { value: "0 1px 2px 0 rgba(15, 23, 42, 0.05)" },
        md: {
          value:
            "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)",
        },
        lg: {
          value:
            "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
        },
        xl: {
          value:
            "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
        },
        glow: { value: "0 4px 14px rgba(79, 70, 229, 0.4)" },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
