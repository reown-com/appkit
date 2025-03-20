import { ConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  ConnectionController,
  ConnectorController,
  type ConnectorWithProviders,
  CoreHelperUtil,
  OptionsController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-controllers'

import { WalletUtil } from './WalletUtil.js'

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
    if (connector.type === 'INJECTED') {
      if (!CoreHelperUtil.isMobile() && connector.name === 'Browser Wallet') {
        return false
      }

      const walletRDNS = connector.info?.rdns

      if (!walletRDNS && !ConnectionController.checkInstalled()) {
        return false
      }

      if (walletRDNS && ApiController.state.excludedRDNS) {
        if (ApiController.state.excludedRDNS.includes(walletRDNS)) {
          return false
        }
      }
    }

    if (connector.type === 'ANNOUNCED') {
      const rdns = connector.info?.rdns

      if (rdns && ApiController.state.excludedRDNS.includes(rdns)) {
        return false
      }
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

      return connectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    })

    return isConnectedWithWC
  }
}
