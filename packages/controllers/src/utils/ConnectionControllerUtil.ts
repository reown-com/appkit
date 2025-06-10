import { type ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'

import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'

// -- Types ------------------------------------------ //
interface ExcludeConnectorAddressFromConnectionsParamters {
  connections: Connection[]
  connectorId?: string
  addresses?: string[]
}

interface ValidateAccountSwitchParamters {
  namespace: ChainNamespace
  connection: Connection
  address?: string
}

// -- Utils ------------------------------------------ //
export const ConnectionControllerUtil = {
  getConnectionStatus(connection: Connection, namespace: ChainNamespace) {
    const connectedConnectorId = ConnectorController.state.activeConnectorIds[namespace]
    const connections = ConnectionController.state.connections.get(namespace) ?? []

    const isConnectorConnected =
      Boolean(connectedConnectorId) && connection.connectorId === connectedConnectorId

    if (isConnectorConnected) {
      return 'connected'
    }

    const isConnectionConnected = connections.some(
      c => c.connectorId.toLowerCase() === connection.connectorId.toLowerCase()
    )

    if (isConnectionConnected) {
      return 'active'
    }

    return 'disconnected'
  },
  validateAccountSwitch({ namespace, connection, address }: ValidateAccountSwitchParamters) {
    const isBitcoin = namespace === CommonConstantsUtil.CHAIN.BITCOIN

    if (isBitcoin) {
      if (!address) {
        throw new Error('Address parameter is required for switching bip122 connection')
      }

      const { type } =
        connection.accounts.find(
          account => account.address.toLowerCase() === address.toLowerCase()
        ) ?? {}

      if (typeof type === 'string' && type !== 'payment') {
        throw new Error(`Switching to non-payment accounts is not allowed for ${namespace}`)
      }
    }
  },
  excludeConnectorAddressFromConnections({
    connections,
    connectorId,
    addresses
  }: ExcludeConnectorAddressFromConnectionsParamters) {
    return connections.map(connection => {
      const isConnectorMatch = connectorId
        ? connection.connectorId.toLowerCase() === connectorId.toLowerCase()
        : false

      if (isConnectorMatch && addresses) {
        const filteredAccounts = connection.accounts.filter(account => {
          const isAddressIncluded = addresses.some(
            address => address.toLowerCase() === account.address.toLowerCase()
          )

          return !isAddressIncluded
        })

        return { ...connection, accounts: filteredAccounts }
      }

      return connection
    })
  },
  excludeExistingConnections(connectorIds: string[], newConnections: Connection[]) {
    const existingConnectorIds = new Set(connectorIds)

    return newConnections.filter(c => !existingConnectorIds.has(c.connectorId))
  },
  getConnectionsByConnectorId(connections: Connection[], connectorId: string) {
    return connections.filter(c => c.connectorId.toLowerCase() === connectorId.toLowerCase())
  },
  filterConnectionsByAccountType(connections: Connection[], accountType: string) {
    return connections.map(c => {
      const filteredAccounts = c.accounts.filter(account =>
        typeof account.type === 'string'
          ? account.type.toLowerCase() === accountType.toLowerCase()
          : true
      )

      return { ...c, accounts: filteredAccounts }
    })
  },
  getConnectionsData(namespace: ChainNamespace) {
    const allConnections = ConnectionController.state.connections.get(namespace) ?? []
    const connections = allConnections.filter(c => !c.recent)

    const activeConnectorId = ConnectorController.state.activeConnectorIds[namespace]

    const recentConnections = allConnections.filter(c => c.recent)
    const recentConnectionsWithCurrentActiveConnectors = recentConnections.filter(connection =>
      ConnectorController.getConnectorById(connection.connectorId)
    )
    const dedupedRecentConnections = ConnectionControllerUtil.excludeExistingConnections(
      [...connections.map(c => c.connectorId), ...(activeConnectorId ? [activeConnectorId] : [])],
      recentConnectionsWithCurrentActiveConnectors
    )

    return {
      connections,
      recentConnections: dedupedRecentConnections
    }
  }
}
