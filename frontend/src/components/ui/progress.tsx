import { Progress as ChakraProgress } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { forwardRef } from "react"

export interface ProgressRootProps extends ChakraProgress.RootProps {
  children?: ReactNode
}

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot(props, ref) {
    return <ChakraProgress.Root ref={ref} {...props} />
  },
)

export interface ProgressBarProps extends ChakraProgress.TrackProps {}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(props, ref) {
    return (
      <ChakraProgress.Track ref={ref} {...props}>
        <ChakraProgress.Range />
      </ChakraProgress.Track>
    )
  },
)

export const ProgressLabel = ChakraProgress.Label
export const ProgressValueText = ChakraProgress.ValueText
