import { Box, Flex, Icon, IconButton, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { FaBars } from "react-icons/fa"
import { FiChevronLeft, FiChevronRight, FiLogOut } from "react-icons/fi"

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useAuth } from "@domains/auth"
import type { UserPublic } from "@domains/users"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Mobile */}
      <DrawerRoot
        placement="start"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <IconButton
            variant="ghost"
            color="white"
            bg="ui.primary"
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="absolute"
            zIndex="100"
            m={4}
            _hover={{
              bg: "blue.600",
            }}
            size="lg"
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="280px">
          <DrawerCloseTrigger />
          <DrawerBody p={0}>
            <Flex flexDir="column" justify="space-between" h="100%">
              <Box px={4} pt={4} flex={1} overflowY="auto">
                <SidebarItems />
              </Box>
              <Box px={4} pb={4}>
                <Flex
                  as="button"
                  onClick={handleLogout}
                  alignItems="center"
                  gap={2}
                  px={3}
                  py={2}
                  borderRadius="md"
                  width="100%"
                  _hover={{
                    bg: "red.50",
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={FiLogOut} color="red.500" fontSize="lg" />
                  <Text fontSize="sm" fontWeight="medium" color="red.500">
                    Log Out
                  </Text>
                </Flex>
                {currentUser && (
                  <Box p={2} borderTop="1px" borderColor="gray.200" mt={2}>
                    <Text fontSize="xs" fontWeight="semibold" truncate>
                      {currentUser.full_name || "User"}
                    </Text>
                    <Text fontSize="xs" color="gray.500" truncate>
                      {currentUser.email}
                    </Text>
                  </Box>
                )}
              </Box>
            </Flex>
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        bg="white"
        width={collapsed ? "70px" : "280px"}
        h="100%"
        borderRight="1px"
        borderColor="gray.200"
        boxShadow="sm"
        transition="all 0.3s ease"
        flexShrink={0}
      >
        <Flex flexDir="column" h="100%" w="100%">
          {/* Collapse/Expand Button */}
          <Flex
            justify={collapsed ? "center" : "flex-end"}
            p={2}
            flexShrink={0}
          >
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              size="sm"
              variant="ghost"
              onClick={toggleSidebar}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </IconButton>
          </Flex>

          {/* Menu Items - Scrollable */}
          <Box flex={1} overflowY="auto" overflowX="hidden">
            <SidebarItems onClose={() => {}} collapsed={collapsed} />
          </Box>

          {/* Footer Section - Fixed at Bottom */}
          <Box flexShrink={0} borderTop="1px" borderColor="gray.200" py={2}>
            {/* Logout Button */}
            <Flex
              as="button"
              onClick={handleLogout}
              alignItems="center"
              justifyContent={collapsed ? "center" : "flex-start"}
              gap={collapsed ? 0 : 3}
              px={collapsed ? 2 : 3}
              py={2.5}
              mx={collapsed ? 2 : 3}
              my={2}
              borderRadius="md"
              width={collapsed ? "auto" : "calc(100% - 24px)"}
              _hover={{
                bg: "red.50",
              }}
              transition="all 0.2s"
              title={collapsed ? "Log Out" : ""}
            >
              <Icon as={FiLogOut} color="red.500" fontSize="xl" />
              {!collapsed && (
                <Text fontSize="md" fontWeight="medium" color="red.500">
                  Log Out
                </Text>
              )}
            </Flex>

            {/* User Info */}
            {currentUser && !collapsed && (
              <Box px={4} py={2} mx={1} borderTop="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="semibold" truncate>
                  {currentUser.full_name || "User"}
                </Text>
                <Text fontSize="xs" color="gray.500" truncate>
                  {currentUser.email}
                </Text>
              </Box>
            )}
            {currentUser && collapsed && (
              <Flex
                justify="center"
                py={2}
                borderTop="1px"
                borderColor="gray.200"
                mx={2}
                title={`${currentUser.full_name || "User"}\n${
                  currentUser.email
                }`}
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="ui.primary"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {(currentUser.full_name ||
                    currentUser.email)[0].toUpperCase()}
                </Box>
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default Sidebar
