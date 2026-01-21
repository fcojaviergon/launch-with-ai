import { Box, EmptyState, Heading, Spinner, VStack } from "@chakra-ui/react"
import { FiFile } from "react-icons/fi"
import { useProjectDocuments } from "../api/projects.api"
import { DocumentItem } from "./DocumentItem"
import { DocumentUploadZone } from "./DocumentUploadZone"

interface DocumentListProps {
  projectId: string
}

export const DocumentList = ({ projectId }: DocumentListProps) => {
  const { data: documents, isLoading } = useProjectDocuments(projectId)

  return (
    <Box>
      <Heading size="md" mb={4}>
        Documents
      </Heading>

      <DocumentUploadZone projectId={projectId} />

      {isLoading && (
        <Box mt={6} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {!isLoading && documents && documents.length === 0 && (
        <EmptyState.Root mt={6}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiFile />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No documents yet</EmptyState.Title>
              <EmptyState.Description>
                Upload documents to add them to your project context
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <VStack mt={6} gap={3} align="stretch">
          {documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              projectId={projectId}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}
