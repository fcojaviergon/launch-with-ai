import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    colorPalette: "primary",
    borderRadius: "md",
    transition: "all 0.2s",
    _focus: {
      boxShadow: "outline",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "ui.primary",
        color: "white",
        _hover: {
          bg: "#0284C7",
          transform: "translateY(-1px)",
        },
        _active: {
          bg: "blue.700",
          transform: "translateY(0)",
        },
      },
      outline: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "ui.primary",
        color: "ui.primary",
        _hover: {
          bg: "blue.50",
        },
      },
      ghost: {
        bg: "transparent",
        color: "ui.primary",
        _hover: {
          bg: "gray.100",
        },
        _active: {
          bg: "gray.200",
        },
      },
      link: {
        bg: "transparent",
        color: "ui.primary",
        textDecoration: "underline",
        padding: 0,
        height: "auto",
        _hover: {
          textDecoration: "none",
        },
      },
    },
    size: {
      xs: {
        h: "1.5rem",
        minW: "1.5rem",
        fontSize: "xs",
        px: "0.5rem",
      },
      sm: {
        h: "2rem",
        minW: "2rem",
        fontSize: "sm",
        px: "0.75rem",
      },
      md: {
        h: "2.5rem",
        minW: "2.5rem",
        fontSize: "md",
        px: "1rem",
      },
      lg: {
        h: "3rem",
        minW: "3rem",
        fontSize: "lg",
        px: "1.5rem",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})
