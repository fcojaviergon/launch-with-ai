import { Badge, Container, Flex, Heading, Input, Table } from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { InputGroup } from "@/components/ui/input-group"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { AddUser } from "@domains/admin"
import { UsersService } from "@domains/users"
import type { UserPublic } from "@domains/users"
import { PendingUsers, UserActionsMenu } from "@shared/components"

const usersSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional().catch(undefined),
})

type UsersSearch = z.infer<typeof usersSearchSchema>

const PER_PAGE = 5

function getUsersQueryOptions({
  page,
  search,
}: { page: number; search?: string }) {
  return {
    queryFn: () =>
      UsersService.readUsers({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        search: search || undefined,
      }),
    queryKey: ["users", { page, search }],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  // Superuser guard - only superusers can access admin page
  beforeLoad: ({ context }) => {
    const user = context.queryClient.getQueryData<UserPublic>(["currentUser"])
    if (!user?.is_superuser) {
      throw redirect({ to: "/" })
    }
  },
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

function UsersTable() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, search } = Route.useSearch() as UsersSearch
  const [searchInput, setSearchInput] = useState(search ?? "")

  useEffect(() => {
    setSearchInput(search ?? "")
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== (search ?? "")) {
        navigate({
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            page: 1,
            search: trimmed || undefined,
          }),
        })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, search, navigate])

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getUsersQueryOptions({ page, search }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, page }),
    })

  const users = data?.data ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingUsers />
  }

  return (
    <>
      <InputGroup
        startElement={<FiSearch />}
        width={{ base: "100%", md: "sm" }}
      >
        <Input
          placeholder={t("admin:searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="sm"
        />
      </InputGroup>

      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="20%">{t("admin:fullName")}</Table.ColumnHeader>
            <Table.ColumnHeader w="25%">{t("admin:email")}</Table.ColumnHeader>
            <Table.ColumnHeader w="15%">{t("admin:role")}</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">{t("admin:status")}</Table.ColumnHeader>
            <Table.ColumnHeader w="20%">{t("common:actions")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell w="20%" color={!user.full_name ? "gray" : "inherit"}>
                {user.full_name || t("common:na")}
                {currentUser?.id === user.id && (
                  <Badge ml="1" colorScheme="teal">
                    {t("common:you")}
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell w="25%">{user.email}</Table.Cell>
              <Table.Cell w="15%">
                {user.is_superuser ? t("admin:superuser") : t("common:user")}
              </Table.Cell>
              <Table.Cell w="20%">
                {user.is_active ? t("admin:active") : t("admin:inactive")}
              </Table.Cell>
              <Table.Cell w="20%">
                <UserActionsMenu
                  user={user}
                  disabled={currentUser?.id === user.id}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Admin() {
  const { t } = useTranslation()
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        {t("admin:usersManagement")}
      </Heading>

      <AddUser />
      <UsersTable />
    </Container>
  )
}
