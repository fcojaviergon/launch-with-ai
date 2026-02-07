import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { type ItemCreateFormData, itemCreateSchema } from "@domains/items"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaPlus } from "react-icons/fa"
import { useCreateItem } from "../api/items.api"

export const AddItem = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const createItem = useCreateItem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ItemCreateFormData>({
    resolver: zodResolver(itemCreateSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const onSubmit: SubmitHandler<ItemCreateFormData> = (data) => {
    createItem.mutate(data, {
      onSuccess: () => {
        showSuccessToast(t("items:itemCreatedSuccess"))
        reset()
        setIsOpen(false)
      },
    })
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-item" my={4}>
          <FaPlus fontSize="16px" />
          {t("items:addItem")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("items:addItem")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>{t("items:addItemDescription")}</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.title}
                errorText={errors.title?.message}
                label={t("items:title")}
              >
                <Input
                  id="title"
                  {...register("title")}
                  placeholder={t("items:title")}
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label={t("items:description")}
              >
                <Input
                  id="description"
                  {...register("description")}
                  placeholder={t("items:description")}
                  type="text"
                />
              </Field>
            </VStack>
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
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t("common:save")}
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
