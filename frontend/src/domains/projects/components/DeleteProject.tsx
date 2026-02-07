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
import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Text,
} from "@chakra-ui/react"
import { useCustomToast } from "@shared/hooks"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FaTrash } from "react-icons/fa"
import { useDeleteProject } from "../api/projects.api"
import type { Project } from "../types/projects.types"

interface DeleteProjectProps {
  project: Project
}

export const DeleteProject = ({ project }: DeleteProjectProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        showSuccessToast(t("projects:projectDeletedSuccess"))
        setIsOpen(false)
        navigate({ to: "/projects" })
      },
    })
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      role="alertdialog"
    >
      <DialogTrigger asChild>
        <Button variant="ghost" colorPalette="red" size="sm">
          <FaTrash fontSize="16px" />
          {t("common:delete")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projects:deleteProject")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {t("projects:deleteProjectConfirmation", { name: project.name })}
          </Text>
          <Text mt={2} color="red.500" fontWeight="semibold">
            {t("projects:deleteProjectWarning")}
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <ButtonGroup>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={deleteProject.isPending}
              >
                {t("common:cancel")}
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              colorPalette="red"
              onClick={handleDelete}
              loading={deleteProject.isPending}
            >
              {t("common:delete")}
            </Button>
          </ButtonGroup>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
