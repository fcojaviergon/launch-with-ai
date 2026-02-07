import { Container, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useAuth } from "@domains/auth"
import {
  Appearance,
  ChangePassword,
  DeleteAccount,
  UserInformation,
} from "@domains/users"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const tabsConfig = [
    { value: "my-profile", title: t("settings:myProfile"), component: UserInformation },
    { value: "password", title: t("settings:password"), component: ChangePassword },
    { value: "appearance", title: t("settings:appearance"), component: Appearance },
    { value: "danger-zone", title: t("settings:dangerZone"), component: DeleteAccount },
  ]

  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        {t("settings:userSettings")}
      </Heading>

      <Tabs.Root defaultValue="my-profile" variant="subtle">
        <Tabs.List>
          {finalTabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {finalTabs.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            <tab.component />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}
