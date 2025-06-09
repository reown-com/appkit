import { Badge, Button, Flex, HStack, Text } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import { type Connection, useAppKitAccount } from '@reown/appkit/react'

interface ConnectionAccountProps {
  connection: Connection
  namespace: ChainNamespace
  account: {
    address: string
  }
  activeConnection?: Connection
  isLoading: boolean
  active: boolean
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

export function ConnectionAccount({
  connection,
  namespace,
  account,
  active,
  activeConnection,
  isLoading,
  lastSelectedConnection,
  setLastSelectedConnection,
  onDelete,
  onDisconnect,
  onSwitch
}: ConnectionAccountProps) {
  const { address } = useAppKitAccount({ namespace })

  const isCurrentActiveAccount = account.address === address
  const isCurrentActiveConnection = connection.connectorId === activeConnection?.connectorId

  const isSwitching =
    isLoading &&
    lastSelectedConnection?.connectorId === connection.connectorId &&
    lastSelectedConnection?.address === account.address

  const shortenedAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`

  function handleDisconnect() {
    onDisconnect(connection)
  }

  function handleDelete() {
    onDelete(account.address, connection.connectorId)
  }

  function handleConnect() {
    setLastSelectedConnection({
      connectorId: connection.connectorId,
      address: account.address
    })

    onSwitch(account.address, connection)
  }

  let button = null

  if (isCurrentActiveConnection && isCurrentActiveAccount) {
    button = (
      <Button size="sm" colorScheme="red" onClick={handleDisconnect}>
        Disconnect
      </Button>
    )
  } else if (isCurrentActiveConnection) {
    button = (
      <Flex alignItems="center" gap={2}>
        <Button size="sm" colorScheme="blue" onClick={handleConnect} isLoading={isSwitching}>
          Switch
        </Button>
        <Button size="sm" colorScheme="red" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </Flex>
    )
  } else {
    button = (
      <Flex alignItems="center" gap={2}>
        <Button size="sm" colorScheme="blue" onClick={handleConnect} isLoading={isSwitching}>
          {active ? 'Switch' : 'Connect'}
        </Button>

        {active ? (
          <Button size="sm" colorScheme="red" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button size="sm" colorScheme="red" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </Flex>
    )
  }

  return (
    <Flex key={account.address} justify="space-between" align="center">
      <HStack>
        <Text fontSize="sm" cursor="pointer">
          {shortenedAddress}
        </Text>

        {isCurrentActiveConnection && isCurrentActiveAccount && (
          <Badge colorScheme="green">Connected</Badge>
        )}
      </HStack>

      {button}
    </Flex>
  )
}
