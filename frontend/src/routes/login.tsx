import { LoginForm } from "@/domains/auth"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  // Guest guard - redirect logged-in users to home
  beforeLoad: ({ context }) => {
    const user = context.queryClient.getQueryData(["currentUser"])
    if (user) {
      throw redirect({ to: "/" })
    }
  },
  component: Login,
})

function Login() {
  return <LoginForm />
}
