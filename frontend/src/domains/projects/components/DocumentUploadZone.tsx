import { useColorModeValue } from "@/components/ui/color-mode"
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

  // Theme-aware colors
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const borderColorHover = useColorModeValue("blue.400", "blue.400")
  const bgColor = useColorModeValue("gray.50", "gray.800")
  const bgColorHover = useColorModeValue("blue.50", "blue.900")
  const bgColorDragging = useColorModeValue("blue.50", "blue.900")
  const iconBg = useColorModeValue("gray.200", "gray.700")
  const iconBgDragging = useColorModeValue("blue.100", "blue.800")
  const iconColor = useColorModeValue("gray.600", "gray.400")
  const iconColorDragging = useColorModeValue("blue.600", "blue.300")
  const textMuted = useColorModeValue("gray.600", "gray.400")

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
        borderColor={isDragging ? "blue.500" : borderColor}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        bg={isDragging ? bgColorDragging : bgColor}
        transition="all 0.2s"
        _hover={{
          borderColor: borderColorHover,
          bg: bgColorHover,
        }}
      >
        <VStack gap={3}>
          <Flex
            justify="center"
            align="center"
            w={16}
            h={16}
            borderRadius="full"
            bg={isDragging ? iconBgDragging : iconBg}
            color={isDragging ? iconColorDragging : iconColor}
            transition="all 0.2s"
          >
            <FaCloudUploadAlt size={32} />
          </Flex>

          <VStack gap={1}>
            <Text fontWeight="semibold" fontSize="lg">
              {isDragging
                ? "Drop files here"
                : "Drag & drop files or click to browse"}
            </Text>
            <Text fontSize="sm" color={textMuted}>
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
