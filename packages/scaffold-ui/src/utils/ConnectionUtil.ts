import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

interface FilterConnectionsParams {
  connections: Connection[]
  filterOutWcConnections?: boolean
  filterOutAuthConnections?: boolean
}

export const ConnectionUtil = {
  excludeAddressFromConnections(connections: Connection[], address?: string) {
    return connections.map(connection => {
      const filteredAccounts = connection.accounts.filter(
        account => !HelpersUtil.isLowerCaseMatch(account.address, address)
      )

      return {
        ...connection,
        accounts: filteredAccounts
      }
    })
  },
  excludeExistingConnections(existingConnections: Connection[], newConnections: Connection[]) {
    const existingConnectionIds = new Set(existingConnections.map(c => c.connectorId))

    return newConnections.filter(conn => !existingConnectionIds.has(conn.connectorId))
  },
  filterConnections({
    connections,
    filterOutWcConnections,
    filterOutAuthConnections
  }: FilterConnectionsParams) {
    return connections.filter(({ connectorId }) => {
      if (
        filterOutWcConnections &&
        HelpersUtil.isLowerCaseMatch(connectorId, CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
      ) {
        return false
      }

      if (
        filterOutAuthConnections &&
        HelpersUtil.isLowerCaseMatch(connectorId, CommonConstantsUtil.CONNECTOR_ID.AUTH)
      ) {
        return false
      }

      return true
    })
  },
  getConnectionsByConnectorId(connections: Connection[], connectorId: string) {
    return connections.filter(c => HelpersUtil.isLowerCaseMatch(c.connectorId, connectorId))
  }
}
