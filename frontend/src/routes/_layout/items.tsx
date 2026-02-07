import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Input,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { InputGroup } from "@/components/ui/input-group"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { ItemsService } from "@domains/items"
import { AddItem } from "@domains/items"
import { ItemActionsMenu, PendingItems } from "@shared/components"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional().catch(undefined),
})

const PER_PAGE = 5

function getItemsQueryOptions({
  page,
  search,
}: { page: number; search?: string }) {
  return {
    queryFn: () =>
      ItemsService.readItems({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        search: search || undefined,
      }),
    queryKey: ["items", { page, search }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function ItemsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, search } = Route.useSearch()
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
    ...getItemsQueryOptions({ page, search }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, page }),
    })

  const items = data?.data ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingItems />
  }

  return (
    <>
      <InputGroup
        startElement={<FiSearch />}
        width={{ base: "100%", md: "sm" }}
      >
        <Input
          placeholder="Search by title or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="sm"
        />
      </InputGroup>

      {items.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiSearch />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {search
                  ? "No items match your search"
                  : "You don't have any items yet"}
              </EmptyState.Title>
              <EmptyState.Description>
                {search
                  ? "Try adjusting your search terms"
                  : "Add a new item to get started"}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <>
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader w="30%">ID</Table.ColumnHeader>
                <Table.ColumnHeader w="30%">Title</Table.ColumnHeader>
                <Table.ColumnHeader w="30%">Description</Table.ColumnHeader>
                <Table.ColumnHeader w="10%">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item) => (
                <Table.Row key={item.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Table.Cell truncate maxW="30%">
                    {item.id}
                  </Table.Cell>
                  <Table.Cell truncate maxW="30%">
                    {item.title}
                  </Table.Cell>
                  <Table.Cell
                    color={!item.description ? "gray" : "inherit"}
                    truncate
                    maxW="30%"
                  >
                    {item.description || "N/A"}
                  </Table.Cell>
                  <Table.Cell width="10%">
                    <ItemActionsMenu item={item} />
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
      )}
    </>
  )
}

function Items() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Items Management
      </Heading>
      <AddItem />
      <ItemsTable />
    </Container>
  )
}
