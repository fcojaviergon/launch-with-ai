import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { Container, Image, Input, Text } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { FiLock, FiMail, FiUser } from "react-icons/fi"
import Logo from "/assets/images/rocket-logo.svg"
import { useAuth } from "../hooks"
import { type SignupFormData, signupSchema } from "../schemas/authSchemas"

export const SignupForm = () => {
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

  const onSubmit = async (data: SignupFormData) => {
    if (isSubmitting) return

    try {
      await signup.mutateAsync(data)
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

      <Field invalid={!!errors.full_name} errorText={errors.full_name?.message}>
        <InputGroup w="100%" startElement={<FiUser />}>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Full Name"
            type="text"
          />
        </InputGroup>
      </Field>

      <Field invalid={!!errors.email} errorText={errors.email?.message}>
        <InputGroup w="100%" startElement={<FiMail />}>
          <Input
            id="email"
            {...register("email")}
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

      <Button variant="solid" type="submit" loading={isSubmitting} size="md">
        Sign Up
      </Button>

      <Text>
        Already have an account?{" "}
        <RouterLink to="/login" className="main-link">
          Log In
        </RouterLink>
      </Text>
    </Container>
  )
}
