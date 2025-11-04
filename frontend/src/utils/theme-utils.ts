import { useColorMode } from "../components/ui/color-mode"

type ColorType =
  | "background"
  | "card"
  | "text"
  | "surface"
  | "border"
  | "shadow"
  | "highlight"

/**
 * Hook que devuelve colores del tema basados en el modo de color actual
 */
export const useThemeColors = () => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === "dark"

  const getColor = (type: ColorType) => {
    return isDark ? `ui.${type}.dark` : `ui.${type}.light`
  }

  return {
    // Colores básicos
    primary: "ui.primary",
    secondary: "ui.secondary",
    accent: "ui.accent",

    // Colores de estado
    success: "ui.success",
    warning: "ui.warning",
    error: "ui.error",
    info: "ui.info",

    // Colores dependientes del modo
    background: getColor("background"),
    card: getColor("card"),
    text: getColor("text"),
    surface: getColor("surface"),
    border: getColor("border"),
    shadow: getColor("shadow"),
    highlight: getColor("highlight"),

    // Colores para componentes específicos
    alertInfo: isDark ? "blue.900" : "blue.50",
    alertSuccess: isDark ? "green.900" : "green.50",
    alertWarning: isDark ? "orange.900" : "orange.50",
    alertError: isDark ? "red.900" : "red.50",

    // Método para obtener variaciones de colores específicas para componentes
    getComponentColor: (component: string, variant = "default") => {
      const componentColors: Record<string, Record<string, string>> = {
        stepper: {
          activeBg: isDark ? "blue.900" : "blue.50",
          inactiveBg: isDark ? "gray.700" : "gray.50",
          activeText: isDark ? "blue.300" : "blue.600",
          inactiveText: isDark ? "gray.400" : "gray.600",
          completed: isDark ? "green.400" : "green.500",
        },
        card: {
          default: isDark ? "gray.800" : "white",
          highlight: isDark ? "blue.900" : "blue.50",
          muted: isDark ? "gray.700" : "gray.50",
        },
      }

      return componentColors[component]?.[variant] || getColor("card")
    },
  }
}
