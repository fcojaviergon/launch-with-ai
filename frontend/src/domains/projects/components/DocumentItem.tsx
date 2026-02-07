import { useColorModeValue } from "@/components/ui/color-mode"
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import { Badge, Box, Flex, IconButton, Text } from "@chakra-ui/react"
import { useCustomToast } from "@shared/hooks"
import { formatDistanceToNow } from "date-fns"
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
  FaTrash,
} from "react-icons/fa"
import {
  useDeleteDocument,
  useDocumentProgress,
  useRetryDocument,
} from "../api/projects.api"
import type { Document } from "../types/projects.types"

interface DocumentItemProps {
  document: Document
  projectId: string
}

export const DocumentItem = ({ document, projectId }: DocumentItemProps) => {
  const { showSuccessToast } = useCustomToast()
  const deleteDocument = useDeleteDocument()
  const retryDocument = useRetryDocument()
  const { data: progress } = useDocumentProgress(
    document.status === "processing" ? document.id : undefined,
  )

  // Theme-aware colors
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textMuted = useColorModeValue("gray.500", "gray.400")
  const textSubtle = useColorModeValue("gray.400", "gray.500")
  const processingText = useColorModeValue("gray.600", "gray.400")

  const handleDelete = () => {
    deleteDocument.mutate(
      { documentId: document.id, projectId },
      {
        onSuccess: () => {
          showSuccessToast("Document deleted successfully")
        },
      },
    )
  }

  const handleRetry = () => {
    retryDocument.mutate(document.id, {
      onSuccess: () => {
        showSuccessToast("Document processing restarted")
      },
    })
  }

  const getStatusBadge = () => {
    switch (document.status) {
      case "completed":
        return (
          <Badge colorPalette="green" variant="subtle">
            <FaCheckCircle /> Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge colorPalette="blue" variant="subtle">
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge colorPalette="red" variant="subtle">
            <FaExclamationCircle /> Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge colorPalette="gray" variant="subtle">
            Pending
          </Badge>
        )
    }
  }

  const processingPercentage =
    document.total_chunks > 0
      ? (document.processed_chunks / document.total_chunks) * 100
      : 0

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Box flex="1">
          <Text fontWeight="semibold" fontSize="md" mb={1}>
            {document.filename}
          </Text>
          <Flex gap={2} align="center" flexWrap="wrap">
            {getStatusBadge()}
            <Text fontSize="xs" color={textMuted}>
              {document.estimated_tokens.toLocaleString()} tokens
            </Text>
          </Flex>
        </Box>

        <Flex gap={2}>
          {document.status === "failed" && (
            <IconButton
              aria-label="Retry processing"
              size="sm"
              variant="ghost"
              colorPalette="blue"
              onClick={handleRetry}
              disabled={retryDocument.isPending}
            >
              <FaRedo />
            </IconButton>
          )}
          <IconButton
            aria-label="Delete document"
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={handleDelete}
            disabled={deleteDocument.isPending}
          >
            <FaTrash />
          </IconButton>
        </Flex>
      </Flex>

      {document.status === "processing" && (
        <Box mt={3}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color={processingText}>
              Processing chunks...
            </Text>
            <Text fontSize="xs" fontWeight="semibold">
              {document.processed_chunks} / {document.total_chunks}
            </Text>
          </Flex>
          <ProgressRoot
            value={processingPercentage}
            colorPalette="blue"
            size="sm"
          >
            <ProgressBar />
          </ProgressRoot>
        </Box>
      )}

      {document.status === "failed" && progress?.error_message && (
        <Text fontSize="xs" color="red.500" mt={2}>
          Error: {progress.error_message}
        </Text>
      )}

      <Text fontSize="xs" color={textSubtle} mt={2}>
        Uploaded{" "}
        {formatDistanceToNow(new Date(document.uploaded_at), {
          addSuffix: true,
        })}
      </Text>
    </Box>
  )
}
