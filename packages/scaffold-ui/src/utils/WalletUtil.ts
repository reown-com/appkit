import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import type { ConnectMethod, Connector, Features, WcWallet } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectorUtil } from './ConnectorUtil.js'
import { ConstantsUtil } from './ConstantsUtil.js'

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

  /**
   * Marks wallets as installed based on available connectors and sorts them
   * according to both installation status and featuredWalletIds order.
   *
   * @param wallets - Array of wallets to process
   * @returns Array of wallets marked as installed and sorted by priority
   */
  markWalletsAsInstalled(wallets: WcWallet[]) {
    const { connectors } = ConnectorController.state
    const { featuredWalletIds } = OptionsController.state

    const installedWalletRdnsMap = connectors
      .filter(connector => connector.type === 'ANNOUNCED')
      .reduce<Record<string, boolean>>((rdnsMap, connector) => {
        if (!connector.info?.rdns) {
          return rdnsMap
        }
        rdnsMap[connector.info.rdns] = true

        return rdnsMap
      }, {})

    // Mark each wallet as installed if its RDNS exists in the installed connectors
    const walletsWithInstallationStatus: AppKitWallet[] = wallets.map(wallet => ({
      ...wallet,
      installed: Boolean(wallet.rdns) && Boolean(installedWalletRdnsMap[wallet.rdns ?? ''])
    }))

    const sortedWallets = walletsWithInstallationStatus.sort((walletA, walletB) => {
      const installationComparison = Number(walletB.installed) - Number(walletA.installed)
      if (installationComparison !== 0) {
        return installationComparison
      }

      if (featuredWalletIds?.length) {
        const walletAFeaturedIndex = featuredWalletIds.indexOf(walletA.id)
        const walletBFeaturedIndex = featuredWalletIds.indexOf(walletB.id)

        if (walletAFeaturedIndex !== -1 && walletBFeaturedIndex !== -1) {
          return walletAFeaturedIndex - walletBFeaturedIndex
        }

        // WalletA is featured, place it first
        if (walletAFeaturedIndex !== -1) {
          return -1
        }

        // WalletB is featured, place it first
        if (walletBFeaturedIndex !== -1) {
          return 1
        }
      }

      return 0
    })

    return sortedWallets
  },

  getConnectOrderMethod(_features: Features | undefined, _connectors: Connector[]) {
    const connectMethodOrder =
      _features?.connectMethodsOrder || OptionsController.state.features?.connectMethodsOrder
    const connectors = _connectors || ConnectorController.state.connectors

    if (connectMethodOrder) {
      return connectMethodOrder
    }

    const { injected, announced } = ConnectorUtil.getConnectorsByType(
      connectors,
      ApiController.state.recommended,
      ApiController.state.featured
    )

    const shownInjected = injected.filter(ConnectorUtil.showConnector)
    const shownAnnounced = announced.filter(ConnectorUtil.showConnector)

    if (shownInjected.length || shownAnnounced.length) {
      return ['wallet', 'email', 'social'] as ConnectMethod[]
    }

    return ConstantsUtil.DEFAULT_CONNECT_METHOD_ORDER
  },
  isExcluded(wallet: WcWallet) {
    const isRDNSExcluded =
      Boolean(wallet.rdns) && ApiController.state.excludedWallets.some(w => w.rdns === wallet.rdns)

    const isNameExcluded =
      Boolean(wallet.name) &&
      ApiController.state.excludedWallets.some(w =>
        HelpersUtil.isLowerCaseMatch(w.name, wallet.name)
      )

    return isRDNSExcluded || isNameExcluded
  }
}
