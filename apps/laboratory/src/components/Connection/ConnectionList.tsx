import { Box, Heading, Text, VStack } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit/react'

import { ConnectionCard } from './ConnectionCard'

interface ConnectionListProps {
  title: string
  connections: Connection[]
  namespace: ChainNamespace
  active?: boolean
  activeConnection?: Connection
  isLoading?: boolean
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

export function ConnectionList({
  title,
  connections,
  namespace,
  active = false,
  activeConnection,
  isLoading = false,
  onDelete,
  onDisconnect,
  onSwitch,
  lastSelectedConnection,
  setLastSelectedConnection
}: ConnectionListProps) {
  return (
    <Box>
      <Heading size="sm" textTransform="uppercase" mb={4}>
        {title}
      </Heading>
      {connections.length > 0 ? (
        <VStack align="stretch" spacing={3}>
          {connections.map(connection => (
            <ConnectionCard
              key={connection.connectorId}
              connection={connection}
              namespace={namespace}
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
        </VStack>
      ) : (
        <Text fontSize="sm" color="gray.500">
          No {title.toLowerCase()} found
        </Text>
      )}
    </Box>
  )
}
