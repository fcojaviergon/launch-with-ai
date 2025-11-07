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
                  <Icon color="red.500">
                    <FiLogOut />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" color="red.500">
                    Log Out
                  </Text>
                </Flex>
                {currentUser && (
                  <Box
                    p={2}
                    borderTop="1px"
                    borderColor="gray.200"
                    mt={2}
                  >
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
        position="sticky"
        bg="white"
        top={0}
        width={collapsed ? "70px" : "280px"}
        h="100vh"
        borderRight="1px"
        borderColor="gray.200"
        boxShadow="sm"
        transition="all 0.3s ease"
      >
        <Flex flexDir="column" justify="space-between" h="100%" w="100%">
          <Box flex={1} overflowY="auto">
            <Flex justify={collapsed ? "center" : "flex-end"} p={2}>
              <IconButton
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                size="sm"
                variant="ghost"
                onClick={toggleSidebar}
              >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </IconButton>
            </Flex>
            <SidebarItems onClose={() => {}} collapsed={collapsed} />
          </Box>
          <Box>
            <Flex
              as="button"
              onClick={handleLogout}
              alignItems="center"
              justifyContent={collapsed ? "center" : "flex-start"}
              gap={collapsed ? 0 : 2}
              px={collapsed ? 2 : 3}
              py={2}
              mx={collapsed ? 2 : 3}
              mb={2}
              borderRadius="md"
              width={collapsed ? "auto" : "calc(100% - 24px)"}
              _hover={{
                bg: "red.50",
              }}
              transition="all 0.2s"
              title={collapsed ? "Log Out" : ""}
            >
              <Icon color="red.500">
                <FiLogOut />
              </Icon>
              {!collapsed && (
                <Text fontSize="sm" fontWeight="medium" color="red.500">
                  Log Out
                </Text>
              )}
            </Flex>
            {currentUser && !collapsed && (
              <Box
                p={2}
                mx={3}
                mb={3}
                borderTop="1px"
                borderColor="gray.200"
              >
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
                p={2}
                title={`${currentUser.full_name || "User"}\n${currentUser.email}`}
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
                  {(currentUser.full_name || currentUser.email)[0].toUpperCase()}
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
