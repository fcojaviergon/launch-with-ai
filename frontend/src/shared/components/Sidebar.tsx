import { Box, Flex, Icon, IconButton, Image, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FaBars } from "react-icons/fa"
import { FiChevronLeft, FiChevronRight, FiLogOut } from "react-icons/fi"

import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
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
import Logo from "/assets/images/launch-logo.svg"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Theme-aware colors
  const sidebarBg = useColorModeValue("white", "gray.900")
  const borderColor = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "gray.100")
  const mutedText = useColorModeValue("gray.500", "gray.400")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const userCardBg = useColorModeValue("gray.50", "gray.800")

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
            variant="solid"
            color="white"
            bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="fixed"
            top={4}
            left={4}
            zIndex="1000"
            _hover={{
              bg: "linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)",
              transform: "scale(1.05)",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
            size="lg"
            borderRadius="xl"
            boxShadow="0 4px 14px rgba(79, 70, 229, 0.4)"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="280px" bg={sidebarBg}>
          <DrawerCloseTrigger />
          <DrawerBody p={0}>
            <Flex flexDir="column" justify="space-between" h="100%">
              {/* Logo Section - Mobile */}
              <Box>
                <Flex
                  px={5}
                  py={5}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  align="center"
                  justify="space-between"
                >
                  <Link to="/">
                    <Image
                      src={Logo}
                      alt="Logo"
                      h="32px"
                      objectFit="contain"
                      transition="opacity 0.2s"
                      _hover={{ opacity: 0.8 }}
                    />
                  </Link>
                  <ColorModeButton
                    borderRadius="lg"
                    color={mutedText}
                    _hover={{ bg: hoverBg, color: textColor }}
                  />
                </Flex>

                <Box px={2} pt={4} flex={1} overflowY="auto">
                  <SidebarItems onClose={() => setOpen(false)} />
                </Box>
              </Box>

              {/* Footer - Mobile */}
              <Box
                px={3}
                pb={4}
                borderTop="1px solid"
                borderColor={borderColor}
              >
                <Flex
                  as="button"
                  onClick={handleLogout}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  mt={3}
                  borderRadius="xl"
                  width="100%"
                  bg="red.50"
                  color="red.600"
                  fontWeight="medium"
                  _hover={{
                    bg: "red.100",
                    transform: "translateX(2px)",
                  }}
                  _active={{
                    transform: "scale(0.98)",
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Icon as={FiLogOut} fontSize="lg" />
                  <Text fontSize="sm">Log Out</Text>
                </Flex>

                {currentUser && (
                  <Flex
                    align="center"
                    gap={3}
                    p={3}
                    mt={3}
                    borderRadius="xl"
                    bg={userCardBg}
                  >
                    <Box
                      w={10}
                      h={10}
                      borderRadius="xl"
                      bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      {(currentUser.full_name ||
                        currentUser.email)[0].toUpperCase()}
                    </Box>
                    <Box overflow="hidden">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textColor}
                        truncate
                      >
                        {currentUser.full_name || "User"}
                      </Text>
                      <Text fontSize="xs" color={mutedText} truncate>
                        {currentUser.email}
                      </Text>
                    </Box>
                  </Flex>
                )}
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        bg={sidebarBg}
        width={collapsed ? "80px" : "260px"}
        h="100vh"
        borderRight="1px solid"
        borderColor={borderColor}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        flexShrink={0}
        position="relative"
      >
        <Flex flexDir="column" h="100%" w="100%">
          {/* Logo Section */}
          <Flex
            px={collapsed ? 3 : 5}
            py={5}
            align="center"
            justify={collapsed ? "center" : "space-between"}
            borderBottom="1px solid"
            borderColor={borderColor}
            flexShrink={0}
          >
            <Link to="/">
              {collapsed ? (
                <Box
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    L
                  </Text>
                </Box>
              ) : (
                <Image
                  src={Logo}
                  alt="Logo"
                  h="28px"
                  objectFit="contain"
                  transition="opacity 0.2s"
                  _hover={{ opacity: 0.8 }}
                />
              )}
            </Link>

            {!collapsed && (
              <Flex gap={1}>
                <ColorModeButton
                  borderRadius="lg"
                  color={mutedText}
                  _hover={{ bg: hoverBg, color: textColor }}
                />
                <IconButton
                  aria-label="Collapse sidebar"
                  size="sm"
                  variant="ghost"
                  onClick={toggleSidebar}
                  borderRadius="lg"
                  color={mutedText}
                  _hover={{ bg: hoverBg, color: textColor }}
                >
                  <FiChevronLeft />
                </IconButton>
              </Flex>
            )}
          </Flex>

          {/* Expand button when collapsed */}
          {collapsed && (
            <Flex
              justify="center"
              gap={1}
              py={3}
              flexDir="column"
              align="center"
            >
              <ColorModeButton
                borderRadius="lg"
                color={mutedText}
                _hover={{ bg: hoverBg, color: textColor }}
              />
              <IconButton
                aria-label="Expand sidebar"
                size="sm"
                variant="ghost"
                onClick={toggleSidebar}
                borderRadius="lg"
                color={mutedText}
                _hover={{ bg: hoverBg, color: textColor }}
              >
                <FiChevronRight />
              </IconButton>
            </Flex>
          )}

          {/* Menu Items - Scrollable */}
          <Box flex={1} overflowY="auto" overflowX="hidden" py={2}>
            <SidebarItems onClose={() => {}} collapsed={collapsed} />
          </Box>

          {/* Footer Section - Fixed at Bottom */}
          <Box
            flexShrink={0}
            borderTop="1px solid"
            borderColor={borderColor}
            py={3}
            px={collapsed ? 2 : 3}
          >
            {/* Logout Button */}
            <Flex
              as="button"
              onClick={handleLogout}
              alignItems="center"
              justifyContent={collapsed ? "center" : "flex-start"}
              gap={collapsed ? 0 : 3}
              px={collapsed ? 0 : 4}
              py={3}
              borderRadius="xl"
              width="100%"
              bg={collapsed ? "transparent" : "red.50"}
              color="red.500"
              fontWeight="medium"
              _hover={{
                bg: "red.100",
                color: "red.600",
                transform: collapsed ? "scale(1.1)" : "translateX(2px)",
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              title={collapsed ? "Log Out" : ""}
            >
              <Icon as={FiLogOut} fontSize={collapsed ? "xl" : "lg"} />
              {!collapsed && <Text fontSize="sm">Log Out</Text>}
            </Flex>

            {/* User Info */}
            {currentUser && !collapsed && (
              <Flex
                align="center"
                gap={3}
                p={3}
                mt={2}
                borderRadius="xl"
                bg={userCardBg}
                transition="all 0.2s"
                _hover={{ bg: hoverBg }}
              >
                <Box
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  {(currentUser.full_name ||
                    currentUser.email)[0].toUpperCase()}
                </Box>
                <Box overflow="hidden">
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    truncate
                  >
                    {currentUser.full_name || "User"}
                  </Text>
                  <Text fontSize="xs" color={mutedText} truncate>
                    {currentUser.email}
                  </Text>
                </Box>
              </Flex>
            )}

            {currentUser && collapsed && (
              <Flex
                justify="center"
                py={2}
                title={`${currentUser.full_name || "User"}\n${
                  currentUser.email
                }`}
              >
                <Box
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                  cursor="default"
                  transition="all 0.2s"
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                  }}
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
