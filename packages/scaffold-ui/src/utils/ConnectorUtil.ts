import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  ConnectionController,
  type Connector,
  ConnectorController,
  type ConnectorTypeOrder,
  type ConnectorWithProviders,
  CoreHelperUtil,
  type CustomWallet,
  OptionsController,
  OptionsUtil,
  type SocialProvider,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import { WalletUtil } from './WalletUtil.js'

// -- Types ------------------------------------------ //
interface GetConnectorTypeOrderParameters {
  recommended: WcWallet[]
  featured: WcWallet[]
  custom: CustomWallet[] | undefined
  recent: WcWallet[]
  announced: WcWallet[]
  injected: WcWallet[]
  multiChain: WcWallet[]
  external: WcWallet[]
  overriddenConnectors?: ConnectorTypeOrder[]
}

export const ConnectorUtil = {
  getConnectorsByType(
    connectors: ConnectorWithProviders[],
    recommended: WcWallet[],
    featured: WcWallet[]
  ) {
    const { customWallets } = OptionsController.state
    const recent = StorageUtil.getRecentWallets()

    const filteredRecommended = WalletUtil.filterOutDuplicateWallets(recommended)
    const filteredFeatured = WalletUtil.filterOutDuplicateWallets(featured)

    const multiChain = connectors.filter(connector => connector.type === 'MULTI_CHAIN')
    const announced = connectors.filter(connector => connector.type === 'ANNOUNCED')
    const injected = connectors.filter(connector => connector.type === 'INJECTED')
    const external = connectors.filter(connector => connector.type === 'EXTERNAL')

    return {
      custom: customWallets,
      recent,
      external,
      multiChain,
      announced,
      injected,
      recommended: filteredRecommended,
      featured: filteredFeatured
    }
  },

  showConnector(connector: ConnectorWithProviders) {
    const rdns = connector.info?.rdns

    const isRDNSExcluded =
      Boolean(rdns) &&
      ApiController.state.excludedWallets.some(
        wallet => Boolean(wallet.rdns) && wallet.rdns === rdns
      )

    const isNameExcluded =
      Boolean(connector.name) &&
      ApiController.state.excludedWallets.some(wallet =>
        HelpersUtil.isLowerCaseMatch(wallet.name, connector.name)
      )

    if (connector.type === 'INJECTED') {
      const isBrowserWallet = connector.name === 'Browser Wallet'

      if (isBrowserWallet) {
        if (!CoreHelperUtil.isMobile()) {
          return false
        }

        if (CoreHelperUtil.isMobile() && !rdns && !ConnectionController.checkInstalled()) {
          return false
        }
      }

      if (isRDNSExcluded || isNameExcluded) {
        return false
      }
    }

    if (
      (connector.type === 'ANNOUNCED' || connector.type === 'EXTERNAL') &&
      (isRDNSExcluded || isNameExcluded)
    ) {
      return false
    }

    return true
  },

  /**
   * Returns true if the user is connected to a WalletConnect connector in the any of the available namespaces.
   * @returns boolean
   */
  getIsConnectedWithWC() {
    const chains = Array.from(ChainController.state.chains.values())
    const isConnectedWithWC = chains.some(chain => {
      const connectorId = ConnectorController.getConnectorId(chain.namespace)

      return connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    })

    return isConnectedWithWC
  },

  /**
   * Returns the connector positions in the order of the user's preference.
   * @returns ConnectorTypeOrder[]
   */
  getConnectorTypeOrder({
    recommended,
    featured,
    custom,
    recent,
    announced,
    injected,
    multiChain,
    external,
    overriddenConnectors = OptionsController.state.features?.connectorTypeOrder ?? []
  }: GetConnectorTypeOrderParameters) {
    const allConnectors = [
      { type: 'walletConnect', isEnabled: true },
      { type: 'recent', isEnabled: recent.length > 0 },
      { type: 'injected', isEnabled: [...injected, ...announced, ...multiChain].length > 0 },
      { type: 'featured', isEnabled: featured.length > 0 },
      { type: 'custom', isEnabled: custom && custom.length > 0 },
      { type: 'external', isEnabled: external.length > 0 },
      { type: 'recommended', isEnabled: recommended.length > 0 }
    ]

    const enabledConnectors = allConnectors.filter(option => option.isEnabled)

    const enabledConnectorTypes = new Set(enabledConnectors.map(option => option.type))

    const prioritizedConnectors = overriddenConnectors
      .filter(type => enabledConnectorTypes.has(type))
      .map(type => ({ type, isEnabled: true }))

    const remainingConnectors = enabledConnectors.filter(({ type: enabledConnectorType }) => {
      const hasPrioritizedConnector = prioritizedConnectors.some(
        ({ type: prioritizedConnectorType }) => prioritizedConnectorType === enabledConnectorType
      )

      return !hasPrioritizedConnector
    })

    return Array.from(
      new Set([...prioritizedConnectors, ...remainingConnectors].map(({ type }) => type))
    )
  },
  sortConnectorsByExplorerWallet(connectors: ConnectorWithProviders[]) {
    return [...connectors].sort((a, b) => {
      if (a.explorerWallet && b.explorerWallet) {
        return (a.explorerWallet.order ?? 0) - (b.explorerWallet.order ?? 0)
      }

      if (a.explorerWallet) {
        return -1
      }

      if (b.explorerWallet) {
        return 1
      }

      return 0
    })
  },
  getAuthName({
    email,
    socialUsername,
    socialProvider
  }: {
    email: string
    socialUsername?: string | null
    socialProvider?: SocialProvider | null
  }) {
    if (socialUsername) {
      if (socialProvider && socialProvider === 'discord' && socialUsername.endsWith('0')) {
        return socialUsername.slice(0, -1)
      }

      return socialUsername
    }

    return email.length > 30 ? `${email.slice(0, -3)}...` : email
  },
  async fetchProviderData(connector: Connector) {
    try {
      if (connector.name === 'Browser Wallet' && !CoreHelperUtil.isMobile()) {
        return { accounts: [], chainId: undefined }
      }

      if (connector.id === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
        return { accounts: [], chainId: undefined }
      }

      const [accounts, chainId] = await Promise.all([
        connector.provider?.request({ method: 'eth_accounts' }) as Promise<string[]>,
        connector.provider
          ?.request({ method: 'eth_chainId' })
          .then(hexChainId => Number(hexChainId))
      ])

      return { accounts, chainId }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to fetch provider data for ${connector.name}`, err)

      return { accounts: [], chainId: undefined }
    }
  },

  /**
   * Filter out duplicate custom wallets by RDNS
   * @param wallets
   */
  getFilteredCustomWallets(wallets: WcWallet[]) {
    const recent = StorageUtil.getRecentWallets()

    const connectorRDNSs = ConnectorController.state.connectors
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

  hasWalletConnector(wallet: WcWallet) {
    return ConnectorController.state.connectors.some(
      connector => connector.id === wallet.id || connector.name === wallet.name
    )
  },

  isWalletCompatibleWithCurrentChain(wallet: WcWallet) {
    const currentNamespace = ChainController.state.activeChain

    if (currentNamespace && wallet.chains) {
      return wallet.chains.some(c => {
        const chainNamespace = c.split(':')[0]

        return currentNamespace === (chainNamespace as typeof currentNamespace)
      })
    }

    return true
  },

  getFilteredRecentWallets() {
    const recentWallets = StorageUtil.getRecentWallets()
    const filteredRecentWallets = recentWallets
      .filter(wallet => !WalletUtil.isExcluded(wallet))
      .filter(wallet => !this.hasWalletConnector(wallet))
      .filter(wallet => this.isWalletCompatibleWithCurrentChain(wallet))

    return filteredRecentWallets
  },

  getCappedRecommendedWallets(wallets: WcWallet[]) {
    const { connectors } = ConnectorController.state
    const { customWallets, featuredWalletIds } = OptionsController.state

    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    const injectedConnectors = connectors.filter(
      c => c.type === 'INJECTED' || c.type === 'ANNOUNCED' || c.type === 'MULTI_CHAIN'
    )

    if (!wcConnector && !injectedConnectors.length && !customWallets?.length) {
      return []
    }

    const isEmailEnabled = OptionsUtil.isEmailEnabled()
    const isSocialsEnabled = OptionsUtil.isSocialsEnabled()

    const injectedWallets = injectedConnectors.filter(i => i.name !== 'Browser Wallet')

    const featuredWalletAmount = featuredWalletIds?.length || 0
    const customWalletAmount = customWallets?.length || 0
    const injectedWalletAmount = injectedWallets.length || 0
    const emailWalletAmount = isEmailEnabled ? 1 : 0
    const socialWalletAmount = isSocialsEnabled ? 1 : 0
    const walletsDisplayed =
      featuredWalletAmount +
      customWalletAmount +
      injectedWalletAmount +
      emailWalletAmount +
      socialWalletAmount

    const DISPLAYED_WALLETS_AMOUNT = 4
    const sliceAmount = Math.max(0, DISPLAYED_WALLETS_AMOUNT - walletsDisplayed)
    if (sliceAmount <= 0) {
      return []
    }

    const filtered = WalletUtil.filterOutDuplicateWallets(wallets)

    return filtered.slice(0, sliceAmount)
  }
}
