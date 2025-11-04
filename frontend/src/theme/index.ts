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
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#638cd3" },
          primary: { value: "#638cd3" },
          secondary: { value: "#0284C7" },
          accent: { value: "#0284c7" },

          background: {
            light: { value: "#ffffff" },
            dark: { value: "#121212" },
          },
          card: {
            light: { value: "#ffffff" },
            dark: { value: "#1E1E1E" },
          },
          text: {
            light: { value: "#111827" },
            dark: { value: "#f3f4f6" },
          },

          success: { value: "#10b981" },
          warning: { value: "#f59e0b" },
          error: { value: "#ef4444" },
          info: { value: "#0ea5e9" },

          surface: {
            light: { value: "#f9fafb" },
            dark: { value: "#1f2937" },
          },
          border: {
            light: { value: "#d1d5db" },
            dark: { value: "#374151" },
          },

          shadow: {
            light: { value: "rgba(0, 0, 0, 0.1)" },
            dark: { value: "rgba(0, 0, 0, 0.3)" },
          },
          highlight: {
            light: { value: "#ecfdf5" },
            dark: { value: "#064e3b" },
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
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
