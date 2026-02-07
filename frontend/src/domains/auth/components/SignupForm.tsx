import { Button } from "@/components/ui/button"
import { useColorModeValue } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Box,
  Center,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FiLock, FiMail, FiUser } from "react-icons/fi"
import { useAuth } from "../hooks"
import { type SignupFormData, signupSchema } from "../schemas/authSchemas"

export const SignupForm = () => {
  const { t } = useTranslation()
  const { signup } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  })

  // Theme colors
  const bgColor = useColorModeValue("gray.50", "gray.950")
  const cardBg = useColorModeValue("white", "gray.900")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const mutedText = useColorModeValue("gray.600", "gray.400")

  const onSubmit = async (data: SignupFormData) => {
    if (isSubmitting) return

    try {
      await signup.mutateAsync(data)
    } catch {
      // Error is handled by the mutation
    }
  }

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Left side - decorative */}
      <Box
        display={{ base: "none", lg: "flex" }}
        flex="1"
        bg="linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0EA5E9 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="60%"
          h="60%"
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="-20%"
          w="80%"
          h="80%"
          borderRadius="full"
          bg="rgba(255,255,255,0.05)"
        />
        <Center flex="1" p={12}>
          <VStack gap={6} color="white" textAlign="center" maxW="400px">
            <Box
              w={20}
              h={20}
              borderRadius="2xl"
              bg="rgba(255,255,255,0.2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
            >
              <Text fontSize="3xl" fontWeight="bold">
                L
              </Text>
            </Box>
            <Heading size="2xl" fontWeight="bold">
              {t("auth:launchWithAi")}
            </Heading>
            <Text fontSize="lg" opacity={0.9}>
              {t("auth:signupHeroText")}
            </Text>
          </VStack>
        </Center>
      </Box>

      {/* Right side - form */}
      <Center flex="1" p={{ base: 6, md: 12 }}>
        <Box
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          w="full"
          maxW="400px"
          bg={cardBg}
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="xl"
        >
          {/* Mobile logo */}
          <Center display={{ base: "flex", lg: "none" }} mb={8}>
            <Box
              w={14}
              h={14}
              borderRadius="xl"
              bg="linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontSize="2xl" fontWeight="bold">
                L
              </Text>
            </Box>
          </Center>

          <VStack gap={2} mb={8}>
            <Heading size="xl" fontWeight="bold">
              {t("auth:createAccount")}
            </Heading>
            <Text color={mutedText} textAlign="center">
              {t("auth:signupSubtitle")}
            </Text>
          </VStack>

          <VStack gap={4}>
            <Field
              invalid={!!errors.full_name}
              errorText={errors.full_name?.message}
            >
              <InputGroup w="100%" startElement={<FiUser />}>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder={t("auth:fullName")}
                  type="text"
                  size="lg"
                />
              </InputGroup>
            </Field>

            <Field invalid={!!errors.email} errorText={errors.email?.message}>
              <InputGroup w="100%" startElement={<FiMail />}>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder={t("auth:email")}
                  type="email"
                  size="lg"
                />
              </InputGroup>
            </Field>

            <PasswordInput
              type="password"
              startElement={<FiLock />}
              {...register("password")}
              placeholder={t("auth:password")}
              errors={errors}
              size="lg"
            />

            <Button
              variant="solid"
              type="submit"
              loading={isSubmitting}
              size="lg"
              w="full"
            >
              {t("auth:createAccount")}
            </Button>
          </VStack>

          <Text textAlign="center" mt={8} color={mutedText}>
            {t("auth:hasAccount")}{" "}
            <RouterLink to="/login" className="main-link">
              {t("auth:signInLink")}
            </RouterLink>
          </Text>
        </Box>
      </Center>
    </Flex>
  )
}
