import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { Container, Image, Input, Text } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"
import Logo from "/assets/images/rocket-logo.svg"
import { useAuth } from "../hooks"
import { type LoginFormData, loginSchema } from "../schemas/authSchemas"

export const LoginForm = () => {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return

    try {
      await login.mutateAsync(data)
    } catch {
      // Error is handled by the mutation
    }
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      h="100vh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Image
        src={Logo}
        alt="Rocket GenAI Logo"
        height="auto"
        maxW="2xs"
        alignSelf="center"
        mb={4}
      />
      <Text fontSize="xl" fontWeight="bold" textAlign="center" mb={2}>
        Welcome Back! 🚀
      </Text>
      <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
        GitHub Actions Automated Deployment ✨
      </Text>

      <Field invalid={!!errors.username} errorText={errors.username?.message}>
        <InputGroup w="100%" startElement={<FiMail />}>
          <Input
            id="username"
            {...register("username")}
            placeholder="Email"
            type="email"
          />
        </InputGroup>
      </Field>

      <PasswordInput
        type="password"
        startElement={<FiLock />}
        {...register("password")}
        placeholder="Password"
        errors={errors}
      />

      <RouterLink to="/recover-password" className="main-link">
        Forgot Password?
      </RouterLink>

      <Button variant="solid" type="submit" loading={isSubmitting} size="md">
        Log In
      </Button>

      <Text>
        Don't have an account?{" "}
        <RouterLink to="/signup" className="main-link">
          Sign Up
        </RouterLink>
      </Text>
    </Container>
  )
}
