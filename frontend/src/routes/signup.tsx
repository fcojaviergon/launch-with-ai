import { SignupForm, useCurrentUser } from "@/domains/auth"
import { Center, Spinner } from "@chakra-ui/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/signup")({
  component: SignUp,
})

function SignUp() {
  const { data: user, isLoading } = useCurrentUser()
  const navigate = useNavigate()

  // Redirect to home if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/" })
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (user) {
    return null
  }

  return <SignupForm />
}

export default SignUp
