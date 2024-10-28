import {
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-core'
import type { WcWallet } from '@reown/appkit-core'

interface AppKitWallet extends WcWallet {
  installed: boolean
}

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
    const connectors = ConnectorController.state.connectors.filter(
      connector => connector.type === 'ANNOUNCED' || connector.type === 'INJECTED'
    )
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
  },

  markWalletsAsInstalled(wallets: WcWallet[]) {
    const { connectors } = ConnectorController.state
    const installedConnectors = connectors
      .filter(c => c.type === 'ANNOUNCED')
      .reduce<Record<string, boolean>>((acum, val) => {
        if (!val.info?.rdns) {
          return acum
        }
        acum[val.info.rdns] = true

        return acum
      }, {})

    const walletsWithInstalled: AppKitWallet[] = wallets.map(wallet => ({
      ...wallet,
      installed: Boolean(wallet.rdns) && Boolean(installedConnectors[wallet.rdns ?? ''])
    }))

    const sortedWallets = walletsWithInstalled.sort(
      (a, b) => Number(b.installed) - Number(a.installed)
    )

    return sortedWallets
  }
}
