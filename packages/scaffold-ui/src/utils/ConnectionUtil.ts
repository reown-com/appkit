import type { Connection } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

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
  filterOutWcConnections(connections: Connection[]) {
    return connections.filter(connection => {
      const isWcConnection = HelpersUtil.isLowerCaseMatch(connection.connectorId, 'walletconnect')

      return !isWcConnection
    })
  }
}
