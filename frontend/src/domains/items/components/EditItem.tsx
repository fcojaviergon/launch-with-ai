import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import type { ItemPublic } from "@domains/items"
import { itemUpdateSchema, type ItemUpdateFormData } from "@domains/items"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCustomToast } from "@shared/hooks"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import { useUpdateItem } from "../api/items.api"

interface EditItemProps {
  item: ItemPublic
}

export const EditItem = ({ item }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const updateItem = useUpdateItem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemUpdateFormData>({
    resolver: zodResolver(itemUpdateSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...item,
      description: item.description ?? undefined,
    },
  })

  const onSubmit: SubmitHandler<ItemUpdateFormData> = async (data) => {
    updateItem.mutate(
      { itemId: item.id, data },
      {
        onSuccess: () => {
          showSuccessToast("Item updated successfully.")
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
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the item details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.title}
                errorText={errors.title?.message}
                label="Title"
              >
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Title"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Description"
              >
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Description"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
