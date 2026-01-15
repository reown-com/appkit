import { type ChainNamespace } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'

import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { EventsController } from '../controllers/EventsController.js'
import { OptionsController } from '../controllers/OptionsController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import type { WcWallet } from './TypeUtil.js'

// -- Types ------------------------------------------ //
interface ExcludeConnectorAddressFromConnectionsParamters {
  connections: Connection[]
  connectorId?: string
  addresses?: string[]
}

// -- Utils ------------------------------------------ //
export const ConnectionControllerUtil = {
  getConnectionStatus(connection: Connection, namespace: ChainNamespace) {
    const connectedConnectorId = ConnectorController.state.activeConnectorIds[namespace]
    const connections = ConnectionController.getConnections(namespace)

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
  getConnectionsData(namespace: ChainNamespace) {
    const isMultiWalletEnabled = Boolean(OptionsController.state.remoteFeatures?.multiWallet)

    const activeConnectorId = ConnectorController.state.activeConnectorIds[namespace]

    const connections = ConnectionController.getConnections(namespace)
    const recentConnections = ConnectionController.state.recentConnections.get(namespace) ?? []
    const recentConnectionsWithCurrentActiveConnectors = recentConnections.filter(connection =>
      ConnectorController.getConnectorById(connection.connectorId)
    )
    const dedupedRecentConnections = ConnectionControllerUtil.excludeExistingConnections(
      [...connections.map(c => c.connectorId), ...(activeConnectorId ? [activeConnectorId] : [])],
      recentConnectionsWithCurrentActiveConnectors
    )

    if (!isMultiWalletEnabled) {
      return {
        connections: connections.filter(
          c => c.connectorId.toLowerCase() === activeConnectorId?.toLowerCase()
        ),
        recentConnections: []
      }
    }

    return {
      connections,
      recentConnections: dedupedRecentConnections
    }
  },
  onConnectMobile(wallet: WcWallet | undefined, wcPayUrl?: string) {
    const wcUri = ConnectionController.state.wcUri

    if (wallet?.mobile_link && wcUri) {
      try {
        ConnectionController.setWcError(false)
        const { mobile_link, link_mode, name } = wallet
        const uriWithPay = CoreHelperUtil.appendPayToUri(wcUri, wcPayUrl)
        const { redirect, redirectUniversalLink, href } = CoreHelperUtil.formatNativeUrl(
          mobile_link,
          uriWithPay,
          link_mode
        )

        const deepLink = redirect
        const universalLink = redirectUniversalLink
        const target = CoreHelperUtil.isIframe() ? '_top' : '_self'

        ConnectionController.setWcLinking({ name, href })
        ConnectionController.setRecentWallet(wallet)

        if (OptionsController.state.experimental_preferUniversalLinks && universalLink) {
          CoreHelperUtil.openHref(universalLink, target)
        } else {
          CoreHelperUtil.openHref(deepLink, target)
        }
      } catch (e) {
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_PROXY_ERROR',
          properties: {
            message: e instanceof Error ? e.message : 'Error parsing the deep link',
            uri: wcUri,
            mobile_link: wallet.mobile_link,
            name: wallet.name
          }
        })
        ConnectionController.setWcError(true)
      }
    }
  }
}
