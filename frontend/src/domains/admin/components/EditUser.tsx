import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import {
  Button,
  DialogActionTrigger,
  DialogRoot,
  DialogTrigger,
  Flex,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  type AdminUserUpdateFormData,
  adminUserUpdateSchema,
} from "@domains/admin"
import type { UserPublic } from "@domains/users"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaExchangeAlt } from "react-icons/fa"
import { useAdminUpdateUser } from "../api/admin.api"

interface EditUserProps {
  user: UserPublic
}

export const EditUser = ({ user }: EditUserProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const updateUser = useAdminUpdateUser()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserUpdateFormData>({
    resolver: zodResolver(adminUserUpdateSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: user,
  })

  const onSubmit: SubmitHandler<AdminUserUpdateFormData> = async (data) => {
    if (data.password === "") {
      data.password = undefined
    }

    updateUser.mutate(
      { userId: user.id, data },
      {
        onSuccess: () => {
          showSuccessToast(t("admin:userUpdatedSuccess"))
          reset()
          setIsOpen(false)
        },
      },
    )
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FaExchangeAlt fontSize="16px" />
          {t("admin:editUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("admin:editUser")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("admin:editUserDescription")}</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.email}
                errorText={errors.email?.message}
                label={t("admin:email")}
              >
                <Input
                  id="email"
                  {...register("email")}
                  placeholder={t("admin:email")}
                  type="email"
                />
              </Field>

              <Field
                invalid={!!errors.full_name}
                errorText={errors.full_name?.message}
                label={t("admin:fullName")}
              >
                <Input
                  id="name"
                  {...register("full_name")}
                  placeholder={t("admin:fullName")}
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.password}
                errorText={errors.password?.message}
                label={t("admin:setPassword")}
              >
                <Input
                  id="password"
                  {...register("password")}
                  placeholder={t("auth:password")}
                  type="password"
                />
              </Field>

              <Field
                invalid={!!errors.confirm_password}
                errorText={errors.confirm_password?.message}
                label={t("admin:confirmPassword")}
              >
                <Input
                  id="confirm_password"
                  {...register("confirm_password")}
                  placeholder={t("auth:password")}
                  type="password"
                />
              </Field>
            </VStack>

            <Flex mt={4} direction="column" gap={4}>
              <Controller
                control={control}
                name="is_superuser"
                render={({ field }) => (
                  <Field disabled={field.disabled} colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      {t("admin:isSuperuser")}
                    </Checkbox>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field disabled={field.disabled} colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      {t("admin:isActive")}
                    </Checkbox>
                  </Field>
                )}
              />
            </Flex>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                {t("common:cancel")}
              </Button>
            </DialogActionTrigger>
            <Button variant="solid" type="submit" loading={isSubmitting}>
              {t("common:save")}
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
