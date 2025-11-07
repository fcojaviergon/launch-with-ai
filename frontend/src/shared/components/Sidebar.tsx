import { Avatar } from "@/components/ui/avatar"
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
          <DrawerBody>
            <Flex flexDir="column" justify="space-between" h="100%">
              <Box>
                <SidebarItems />
              </Box>
              <Box>
                <Flex
                  as="button"
                  onClick={handleLogout}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  my={2}
                  borderRadius="md"
                  width="100%"
                  _hover={{
                    bg: "red.50",
                  }}
                  transition="all 0.2s"
                >
                  <Icon color="red.500" fontSize="lg">
                    <FiLogOut />
                  </Icon>
                  <Text fontWeight="medium" color="red.500">
                    Log Out
                  </Text>
                </Flex>
                {currentUser && (
                  <Flex
                    p={3}
                    borderTop="1px solid"
                    borderColor="gray.200"
                    mt={2}
                    gap={3}
                    alignItems="center"
                  >
                    <Avatar
                      name={currentUser.full_name || currentUser.email}
                      size="sm"
                    />
                    <Box flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight="semibold" truncate>
                        {currentUser.full_name || "User"}
                      </Text>
                      <Text fontSize="xs" color="gray.500" truncate>
                        {currentUser.email}
                      </Text>
                    </Box>
                  </Flex>
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
        p={collapsed ? 2 : 4}
        borderRight="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        transition="all 0.3s ease"
      >
        <Flex flexDir="column" justify="space-between" h="100%" w="100%">
          <Box>
            <Flex justify={collapsed ? "center" : "flex-end"} mb={2}>
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
              gap={collapsed ? 0 : 3}
              px={collapsed ? 2 : 4}
              py={3}
              my={2}
              borderRadius="md"
              width="100%"
              _hover={{
                bg: "red.50",
              }}
              transition="all 0.2s"
              title={collapsed ? "Log Out" : ""}
            >
              <Icon color="red.500" fontSize="lg">
                <FiLogOut />
              </Icon>
              {!collapsed && (
                <Text fontWeight="medium" color="red.500">
                  Log Out
                </Text>
              )}
            </Flex>
            {currentUser && !collapsed && (
              <Flex
                p={3}
                borderTop="1px solid"
                borderColor="gray.200"
                mt={2}
                gap={3}
                alignItems="center"
              >
                <Avatar
                  name={currentUser.full_name || currentUser.email}
                  size="sm"
                />
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="semibold" truncate>
                    {currentUser.full_name || "User"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {currentUser.email}
                  </Text>
                </Box>
              </Flex>
            )}
            {currentUser && collapsed && (
              <Flex
                justify="center"
                p={2}
                mt={1}
                title={`${currentUser.full_name || "User"}\n${currentUser.email}`}
              >
                <Avatar
                  name={currentUser.full_name || currentUser.email}
                  size="sm"
                />
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  )
}

export default Sidebar
