import { Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react"
import { useCustomToast } from "@shared/hooks"
import { useRef, useState } from "react"
import { FaCloudUploadAlt } from "react-icons/fa"
import { useUploadDocument } from "../api/projects.api"

interface DocumentUploadZoneProps {
  projectId: string
}

export const DocumentUploadZone = ({ projectId }: DocumentUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const uploadDocument = useUploadDocument()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const validExtensions = [".pdf", ".docx", ".txt"]

    for (const file of files) {
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase()

      if (!validExtensions.includes(fileExtension)) {
        showErrorToast(
          `File ${file.name} has unsupported format. Supported: PDF, DOCX, TXT`,
        )
        continue
      }

      // Upload the file
      uploadDocument.mutate(
        { projectId, file },
        {
          onSuccess: () => {
            showSuccessToast(`${file.name} uploaded successfully`)
          },
          onError: (error) => {
            showErrorToast(`Failed to upload ${file.name}: ${error.message}`)
          },
        },
      )
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        border="2px dashed"
        borderColor={isDragging ? "blue.500" : "gray.300"}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        bg={isDragging ? "blue.50" : "gray.50"}
        transition="all 0.2s"
        _hover={{
          borderColor: "blue.400",
          bg: "blue.50",
        }}
      >
        <VStack gap={3}>
          <Flex
            justify="center"
            align="center"
            w={16}
            h={16}
            borderRadius="full"
            bg={isDragging ? "blue.100" : "gray.200"}
            color={isDragging ? "blue.600" : "gray.600"}
            transition="all 0.2s"
          >
            <FaCloudUploadAlt size={32} />
          </Flex>

          <VStack gap={1}>
            <Text fontWeight="semibold" fontSize="lg">
              {isDragging ? "Drop files here" : "Upload Documents"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Drag & drop files or click to browse
            </Text>
            <Text fontSize="xs" color="gray.500">
              Supported formats: PDF, DOCX, TXT
            </Text>
          </VStack>

          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
            disabled={uploadDocument.isPending}
          >
            Select Files
          </Button>
        </VStack>

        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          onChange={handleFileSelect}
          display="none"
        />
      </Box>
    </Box>
  )
}
