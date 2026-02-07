import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, DialogTitle, Text } from "@chakra-ui/react"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { FiTrash2 } from "react-icons/fi"
import { useAdminDeleteUser } from "../api/admin.api"

interface DeleteUserProps {
  id: string
}

export const DeleteUser = ({ id }: DeleteUserProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const deleteUser = useAdminDeleteUser()

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const onSubmit = async () => {
    deleteUser.mutate(id, {
      onSuccess: () => {
        showSuccessToast(t("admin:userDeletedSuccess"))
        setIsOpen(false)
      },
      onError: () => {
        showErrorToast(t("admin:userDeletedError"))
      },
    })
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      role="alertdialog"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 fontSize="16px" />
          {t("admin:deleteUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("admin:deleteUser")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              <Trans i18nKey="admin:deleteUserConfirmation" components={{ strong: <strong /> }} />
            </Text>
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
            <Button
              variant="solid"
              colorPalette="red"
              type="submit"
              loading={isSubmitting}
            >
              {t("common:delete")}
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
