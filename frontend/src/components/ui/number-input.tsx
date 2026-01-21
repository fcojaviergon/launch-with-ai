import { NumberInput as ChakraNumberInput } from "@chakra-ui/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { forwardRef } from "react"

export interface NumberInputRootProps extends ChakraNumberInput.RootProps {
  children?: ReactNode
}

export const NumberInputRoot = forwardRef<HTMLDivElement, NumberInputRootProps>(
  function NumberInputRoot(props, ref) {
    return <ChakraNumberInput.Root ref={ref} {...props} />
  },
)

export interface NumberInputFieldProps
  extends ComponentPropsWithoutRef<typeof ChakraNumberInput.Input> {}

export const NumberInputField = forwardRef<
  HTMLInputElement,
  NumberInputFieldProps
>(function NumberInputField(props, ref) {
  return <ChakraNumberInput.Input ref={ref} {...props} />
})

export const NumberInputControl = ChakraNumberInput.Control
export const NumberInputLabel = ChakraNumberInput.Label
export const NumberInputIncrementTrigger = ChakraNumberInput.IncrementTrigger
export const NumberInputDecrementTrigger = ChakraNumberInput.DecrementTrigger
