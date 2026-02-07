import { Container, Heading, Input, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FiMail } from "react-icons/fi"

import type { ApiError } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { LoginService } from "@domains/auth"
import { useCustomToast } from "@shared/hooks"
import { emailPattern, handleError } from "@shared/utils"

interface FormData {
  email: string
}

export const Route = createFileRoute("/recover-password")({
  // Guest guard - redirect logged-in users to home
  beforeLoad: ({ context }) => {
    const user = context.queryClient.getQueryData(["currentUser"])
    if (user) {
      throw redirect({ to: "/" })
    }
  },
  component: RecoverPassword,
})

function RecoverPassword() {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showSuccessToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast(t("auth:passwordRecoverySuccess"))
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
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
      <Heading size="xl" color="ui.main" textAlign="center" mb={2}>
        {t("auth:passwordRecovery")}
      </Heading>
      <Text textAlign="center">
        {t("auth:passwordRecoveryText")}
      </Text>
      <Field invalid={!!errors.email} errorText={errors.email?.message}>
        <InputGroup w="100%" startElement={<FiMail />}>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: emailPattern,
            })}
            placeholder={t("auth:email")}
            type="email"
          />
        </InputGroup>
      </Field>
      <Button variant="solid" type="submit" loading={isSubmitting}>
        {t("common:continue")}
      </Button>
    </Container>
  )
}
