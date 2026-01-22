import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    borderRadius: "xl",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    _focus: {
      outline: "none",
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.3)",
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
        color: "white",
        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
        _hover: {
          bg: "linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
        },
        _active: {
          bg: "linear-gradient(135deg, #3730A3 0%, #4338CA 100%)",
          transform: "translateY(0)",
          boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)",
        },
      },
      outline: {
        bg: "transparent",
        border: "2px solid",
        borderColor: "#4F46E5",
        color: "#4F46E5",
        _hover: {
          bg: "rgba(79, 70, 229, 0.08)",
          borderColor: "#4338CA",
          transform: "translateY(-1px)",
        },
        _active: {
          bg: "rgba(79, 70, 229, 0.12)",
          transform: "translateY(0)",
        },
      },
      ghost: {
        bg: "transparent",
        color: "#4F46E5",
        _hover: {
          bg: "rgba(79, 70, 229, 0.08)",
        },
        _active: {
          bg: "rgba(79, 70, 229, 0.12)",
        },
      },
      link: {
        bg: "transparent",
        color: "#4F46E5",
        padding: 0,
        height: "auto",
        fontWeight: "medium",
        _hover: {
          textDecoration: "underline",
          color: "#4338CA",
        },
      },
      subtle: {
        bg: "rgba(79, 70, 229, 0.1)",
        color: "#4F46E5",
        _hover: {
          bg: "rgba(79, 70, 229, 0.15)",
          transform: "translateY(-1px)",
        },
        _active: {
          bg: "rgba(79, 70, 229, 0.2)",
          transform: "translateY(0)",
        },
      },
      danger: {
        bg: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
        color: "white",
        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
        _hover: {
          bg: "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
        },
        _active: {
          bg: "linear-gradient(135deg, #991B1B 0%, #B91C1C 100%)",
          transform: "translateY(0)",
        },
      },
    },
    size: {
      xs: {
        h: "1.75rem",
        minW: "1.75rem",
        fontSize: "xs",
        px: "0.625rem",
        borderRadius: "lg",
      },
      sm: {
        h: "2.25rem",
        minW: "2.25rem",
        fontSize: "sm",
        px: "0.875rem",
      },
      md: {
        h: "2.75rem",
        minW: "2.75rem",
        fontSize: "sm",
        px: "1.25rem",
      },
      lg: {
        h: "3.25rem",
        minW: "3.25rem",
        fontSize: "md",
        px: "1.75rem",
      },
      xl: {
        h: "3.75rem",
        minW: "3.75rem",
        fontSize: "lg",
        px: "2rem",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})
