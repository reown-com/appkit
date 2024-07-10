import {
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil,
  type WcWallet
} from '@web3modal/core'

export const WalletUtil = {
  filterOutDuplicatesByRDNS(wallets: WcWallet[]) {
    const connectors = OptionsController.state.enableEIP6963
      ? ConnectorController.state.connectors
      : []
    const recent = StorageUtil.getRecentWallets()

    const connectorRDNSs = connectors
      .map(connector => connector.info?.rdns)
      .filter(Boolean) as string[]

    const recentRDNSs = recent.map(wallet => wallet.rdns).filter(Boolean) as string[]
    const allRDNSs = connectorRDNSs.concat(recentRDNSs)
    if (allRDNSs.includes('io.metamask.mobile') && CoreHelperUtil.isMobile()) {
      const index = allRDNSs.indexOf('io.metamask.mobile')
      allRDNSs[index] = 'io.metamask'
    }
    const filtered = wallets.filter(wallet => !allRDNSs.includes(String(wallet?.rdns)))

    return filtered
  },

  filterOutDuplicatesByIds(wallets: WcWallet[]) {
    const connectors = ConnectorController.state.connectors
    const recent = StorageUtil.getRecentWallets()

    const connectorIds = connectors.map(connector => connector.explorerId)

    const recentIds = recent.map(wallet => wallet.id)

    const allIds = connectorIds.concat(recentIds)

    const filtered = wallets.filter(wallet => !allIds.includes(wallet?.id))

    return filtered
  },

  filterOutDuplicateWallets(wallets: WcWallet[]) {
    const uniqueByRDNS = this.filterOutDuplicatesByRDNS(wallets)
    const uniqueWallets = this.filterOutDuplicatesByIds(uniqueByRDNS)

    return uniqueWallets
  }
}
