import { type ChainNamespace } from '@reown/appkit-common'

import { ChainController } from '../controllers/ChainController.js'
import { type Connection, ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { StorageUtil } from './StorageUtil.js'

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
  excludeConnectorFromConnections(connections: Connection[], connectorId?: string) {
    if (!connectorId) {
      return connections
    }

    return connections.filter(c => c.connectorId.toLowerCase() !== connectorId.toLowerCase())
  },
  excludeExistingConnections(connectorIds: string[], newConnections: Connection[]) {
    const existingConnectorIds = new Set(connectorIds)

    return newConnections.filter(c => !existingConnectorIds.has(c.connectorId))
  },
  getConnectionsByConnectorId(connections: Connection[], connectorId: string) {
    return connections.filter(c => c.connectorId.toLowerCase() === connectorId.toLowerCase())
  },
  getConnectionsData(namespace: ChainNamespace) {
    const caipAddress = ChainController.getAccountData(namespace)?.caipAddress

    const connectionsByNamespace = ConnectionController.state.connections.get(namespace) ?? []

    const activeConnectorId = ConnectorController.state.activeConnectorIds[namespace]

    const connections = ConnectionControllerUtil.excludeConnectorFromConnections(
      connectionsByNamespace,
      activeConnectorId
    )

    const storageConnections = StorageUtil.getConnections()
    const storageConnectionsByNamespace = storageConnections[namespace] ?? []
    const storageConnectionsWithCurrentActiveConnectors = storageConnectionsByNamespace.filter(
      connection => ConnectorController.getConnectorById(connection.connectorId)
    )
    const dedupedStorageConnections = ConnectionControllerUtil.excludeExistingConnections(
      [...connections.map(c => c.connectorId), ...(activeConnectorId ? [activeConnectorId] : [])],
      storageConnectionsWithCurrentActiveConnectors
    )

    const hasConnections =
      Boolean(caipAddress) || connections.length > 0 || dedupedStorageConnections.length > 0
    const hasActiveConnections = connections.length > 0
    const hasStorageConnections = dedupedStorageConnections.length > 0

    return {
      hasConnections,
      hasActiveConnections,
      hasStorageConnections,
      connections,
      storageConnections: dedupedStorageConnections
    }
  }
}
