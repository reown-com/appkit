/* eslint-disable max-depth */
import { type ChainNamespace } from '@reown/appkit-common'

import { type Connection, ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'

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
  }
}
