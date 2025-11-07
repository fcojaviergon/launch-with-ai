import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import { FiBriefcase, FiHome, FiSettings, FiUsers } from "react-icons/fi"
import type { IconType } from "react-icons/lib"

import type { UserPublic } from "@domains/users"

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiBriefcase, title: "Items", path: "/items" },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
  collapsed?: boolean
}

interface Item {
  icon: IconType
  title: string
  path: string
}

const SidebarItems = ({ onClose, collapsed = false }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
    : items

  const listItems = finalItems.map(({ icon, title, path }) => {
    // Check if this route is active based on the current path
    let isActive = false

    if (path === "/") {
      // Special case for home route
      isActive = currentPath === "/"
    } else {
      // For other routes, check if the current route starts with this path
      isActive = currentPath === path || currentPath.startsWith(`${path}/`)
    }

    return (
      <RouterLink key={title} to={path} onClick={onClose}>
        <Flex
          gap={collapsed ? 0 : 4}
          px={collapsed ? 2 : 4}
          py={3}
          my={1}
          borderRadius="md"
          bg={isActive ? "ui.primary" : "transparent"}
          color={isActive ? "white" : "inherit"}
          fontWeight={isActive ? "semibold" : "normal"}
          _hover={{
            background: isActive ? "ui.primary" : "gray.100",
            transform: collapsed ? "none" : "translateX(3px)",
          }}
          alignItems="center"
          justifyContent={collapsed ? "center" : "flex-start"}
          fontSize="md"
          transition="all 0.2s ease"
          title={collapsed ? title : ""}
        >
          <Icon
            as={icon}
            alignSelf="center"
            fontSize="lg"
            color={isActive ? "white" : "ui.primary"}
          />
          {!collapsed && <Text>{title}</Text>}
        </Flex>
      </RouterLink>
    )
  })

  return (
    <>
      {!collapsed && (
        <Text
          fontSize="sm"
          px={4}
          py={2}
          fontWeight="bold"
          color="gray.600"
          letterSpacing="wider"
          textTransform="uppercase"
          mt={2}
        >
          Menu
        </Text>
      )}
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
