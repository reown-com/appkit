import { Badge, Box, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import { type Connection } from '@reown/appkit/react'

import { ConnectionAccount } from './ConnectionAccount'

interface ConnectionCardProps {
  connection: Connection
  namespace: ChainNamespace
  active: boolean
  activeConnection?: Connection
  isLoading: boolean
  onDelete: (address: string, connectorId: string) => void
  onDisconnect: (connection: Connection) => void
  onSwitch: (address: string, connection: Connection) => void
  lastSelectedConnection:
    | {
        connectorId: string
        address: string
      }
    | undefined
  setLastSelectedConnection: (lastSelectedConnection: {
    connectorId: string
    address: string
  }) => void
}

export function ConnectionCard({
  connection,
  namespace,
  active,
  activeConnection,
  isLoading,
  onDelete,
  onDisconnect,
  onSwitch,
  lastSelectedConnection,
  setLastSelectedConnection
}: ConnectionCardProps) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <HStack justify="space-between">
        <Flex alignItems="center" gap={2}>
          <Flex alignItems="center" justifyContent="center" position="relative">
            {connection.name && connection.icon && (
              <Image
                src={connection.icon}
                alt={`${connection.name} logo`}
                boxSize="20px"
                borderRadius="md"
              />
            )}

            {connection.icon && connection.networkIcon && (
              <Image
                src={connection.networkIcon}
                alt={`${connection.name} network icon`}
                boxSize="14px"
                borderRadius="full"
                position="absolute"
                top={-1.5}
                right={-1.5}
              />
            )}
          </Flex>

          <Text fontWeight="bold" textTransform="capitalize">
            {connection.auth?.name ?? connection.name}
          </Text>
        </Flex>
        <Badge colorScheme={active ? 'green' : 'blue'}>{active ? 'Active' : 'Recent'}</Badge>
      </HStack>
      <Stack spacing={1} mt={2}>
        {connection.accounts.map(acc => (
          <ConnectionAccount
            key={`conn-acc-${connection.connectorId}-${acc.address}`}
            connection={connection}
            namespace={namespace}
            account={acc}
            active={active}
            activeConnection={activeConnection}
            isLoading={isLoading}
            onDelete={onDelete}
            onDisconnect={onDisconnect}
            onSwitch={onSwitch}
            lastSelectedConnection={lastSelectedConnection}
            setLastSelectedConnection={setLastSelectedConnection}
          />
        ))}
      </Stack>
    </Box>
  )
}
