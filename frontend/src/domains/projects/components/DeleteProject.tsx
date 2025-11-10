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
import { useState } from "react"
import { FaTrash } from "react-icons/fa"
import { useNavigate } from "@tanstack/react-router"
import { useDeleteProject } from "../api/projects.api"
import type { Project } from "../types/projects.types"

interface DeleteProjectProps {
  project: Project
}

export const DeleteProject = ({ project }: DeleteProjectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { showSuccessToast } = useCustomToast()
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        showSuccessToast("Project deleted successfully.")
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
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to delete the project "{project.name}"?
          </Text>
          <Text mt={2} color="red.500" fontWeight="semibold">
            This action cannot be undone. All documents and conversations will be permanently deleted.
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
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              colorPalette="red"
              onClick={handleDelete}
              loading={deleteProject.isPending}
            >
              Delete
            </Button>
          </ButtonGroup>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
