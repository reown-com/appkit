import * as React from 'react'
import { useState } from 'react'

import { Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  type Connection,
  useAppKitConnection,
  useAppKitConnections,
  useDisconnect
} from '@reown/appkit/react'

import { ConnectionList } from './Connection/ConnectionList'
import { useChakraToast } from './Toast'

interface AppKitConnectionsProps {
  namespace: ChainNamespace
  title?: string
}

export function AppKitConnections({ namespace, title = 'Connections' }: AppKitConnectionsProps) {
  const [lastSelectedConnection, setLastSelectedConnection] = useState<{
    connectorId: string
    address: string
  }>()

  const { connections, storageConnections } = useAppKitConnections(namespace)

  const { connection, isPending, switchConnection, deleteConnection } = useAppKitConnection({
    namespace,
    onSuccess({ isWalletSwitched, isWalletDeleted }) {
      let description = 'Account switched'

      if (isWalletDeleted) {
        description = 'Wallet deleted'
      } else if (isWalletSwitched) {
        description = 'Wallet switched'
      }

      toast({
        title: 'Connection',
        description,
        type: 'success'
      })
    },
    onError(error) {
      toast({
        title: 'Connection',
        description: error.message,
        type: 'error'
      })
    }
  })

  const { disconnect } = useDisconnect()

  const toast = useChakraToast()

  function handleDelete(address: string, connectorId: string) {
    deleteConnection({ address, connectorId })
  }

  function handleDisconnect(_connection: Connection) {
    disconnect({ connectorId: _connection.connectorId }).then(() => {
      toast({
        title: 'Disconnected',
        description: 'Wallet disconnected',
        type: 'success'
      })
    })
  }

  function handleSwitch(address: string, _connection: Connection) {
    switchConnection({ connection: _connection, address })
  }

  return (
    <Card my={10}>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing="6" divider={<StackDivider />}>
          <ConnectionList
            title="Connected Wallets"
            connections={connections}
            namespace={namespace}
            activeConnection={connection}
            isLoading={isPending}
            onDelete={handleDelete}
            onDisconnect={handleDisconnect}
            onSwitch={handleSwitch}
            lastSelectedConnection={lastSelectedConnection}
            setLastSelectedConnection={setLastSelectedConnection}
            active
          />
          <ConnectionList
            title="Recent Connected Wallets"
            connections={storageConnections}
            isLoading={isPending}
            namespace={namespace}
            activeConnection={connection}
            onDelete={handleDelete}
            onDisconnect={handleDisconnect}
            onSwitch={handleSwitch}
            lastSelectedConnection={lastSelectedConnection}
            setLastSelectedConnection={setLastSelectedConnection}
          />
        </Stack>
      </CardBody>
    </Card>
  )
}
