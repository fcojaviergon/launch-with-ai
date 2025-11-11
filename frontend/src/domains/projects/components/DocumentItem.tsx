import {
  Badge,
  Box,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react"
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"
import { FaCheckCircle, FaExclamationCircle, FaRedo, FaTrash } from "react-icons/fa"
import { useCustomToast } from "@shared/hooks"
import { useDeleteDocument, useDocumentProgress, useRetryDocument } from "../api/projects.api"
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
    document.status === "processing" ? document.id : undefined
  )

  const handleDelete = () => {
    deleteDocument.mutate(
      { documentId: document.id, projectId },
      {
        onSuccess: () => {
          showSuccessToast("Document deleted successfully")
        },
      }
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

  const processingPercentage = document.total_chunks > 0
    ? (document.processed_chunks / document.total_chunks) * 100
    : 0

  return (
    <Box
      p={4}
      borderWidth="1px"
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
            <Text fontSize="xs" color="gray.500">
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
            <Text fontSize="xs" color="gray.600">
              Processing chunks...
            </Text>
            <Text fontSize="xs" fontWeight="semibold">
              {document.processed_chunks} / {document.total_chunks}
            </Text>
          </Flex>
          <ProgressRoot value={processingPercentage} colorPalette="blue" size="sm">
            <ProgressBar />
          </ProgressRoot>
        </Box>
      )}

      {document.status === "failed" && progress?.error_message && (
        <Text fontSize="xs" color="red.500" mt={2}>
          Error: {progress.error_message}
        </Text>
      )}

      <Text fontSize="xs" color="gray.400" mt={2}>
        Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
      </Text>
    </Box>
  )
}
