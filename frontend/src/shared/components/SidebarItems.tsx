import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import {
  FiBriefcase,
  FiFolder,
  FiHome,
  FiMessageSquare,
  FiSettings,
  FiUsers,
} from "react-icons/fi"
import type { IconType } from "react-icons/lib"
import { useTranslation } from "react-i18next"

import { useColorModeValue } from "@/components/ui/color-mode"
import type { UserPublic } from "@domains/users"

const items = [
  { icon: FiHome, titleKey: "dashboard", path: "/" },
  { icon: FiFolder, titleKey: "projects", path: "/projects" },
  { icon: FiMessageSquare, titleKey: "chat", path: "/chat" },
  { icon: FiBriefcase, titleKey: "items", path: "/items" },
  { icon: FiSettings, titleKey: "settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
  collapsed?: boolean
}

interface Item {
  icon: IconType
  titleKey: string
  path: string
}

const SidebarItems = ({ onClose, collapsed = false }: SidebarItemsProps) => {
  const { t } = useTranslation("navigation")
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Theme-aware colors
  const textColor = useColorModeValue("gray.600", "gray.300")
  const textHover = useColorModeValue("gray.900", "gray.100")
  const hoverBg = useColorModeValue("gray.50", "gray.800")
  const iconColor = useColorModeValue("gray.500", "gray.400")
  const labelColor = useColorModeValue("gray.400", "gray.500")

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, titleKey: "admin", path: "/admin" }]
    : items

  const listItems = finalItems.map(({ icon, titleKey, path }) => {
    let isActive = false

    if (path === "/") {
      isActive = currentPath === "/"
    } else {
      isActive = currentPath === path || currentPath.startsWith(`${path}/`)
    }

    const title = t(titleKey)

    return (
      <RouterLink key={titleKey} to={path} onClick={onClose}>
        <Flex
          gap={collapsed ? 0 : 3}
          px={collapsed ? 0 : 4}
          py={3}
          my={1}
          mx={collapsed ? 1 : 0}
          borderRadius="xl"
          bg={
            isActive
              ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
              : "transparent"
          }
          color={isActive ? "white" : textColor}
          fontWeight={isActive ? "semibold" : "medium"}
          _hover={{
            background: isActive
              ? "linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)"
              : hoverBg,
            color: isActive ? "white" : textHover,
            transform: collapsed ? "scale(1.05)" : "translateX(4px)",
          }}
          _active={{
            transform: "scale(0.98)",
          }}
          alignItems="center"
          justifyContent={collapsed ? "center" : "flex-start"}
          fontSize="sm"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          title={collapsed ? title : ""}
          boxShadow={isActive ? "0 4px 14px rgba(79, 70, 229, 0.3)" : "none"}
        >
          <Icon
            as={icon}
            alignSelf="center"
            fontSize="lg"
            color={isActive ? "white" : iconColor}
            transition="color 0.2s"
          />
          {!collapsed && <Text>{title}</Text>}
        </Flex>
      </RouterLink>
    )
  })

  return (
    <Box px={collapsed ? 1 : 3} py={1}>
      {!collapsed && (
        <Text
          fontSize="xs"
          px={4}
          py={3}
          fontWeight="semibold"
          color={labelColor}
          letterSpacing="0.1em"
          textTransform="uppercase"
        >
          {t("navigation")}
        </Text>
      )}
      <Box>{listItems}</Box>
    </Box>
  )
}

export default SidebarItems
