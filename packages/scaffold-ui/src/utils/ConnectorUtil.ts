import type { Connector } from '@reown/appkit-core'
import { ApiController, AssetController, OptionsController, StorageUtil } from '@reown/appkit-core'
import { WalletUtil } from './WalletUtil.js'

export const ConnectorUtil = {
  getConnectorsByType(connectors: Connector[]) {
    const { featured, recommended } = ApiController.state
    const { customWallets: custom } = OptionsController.state
    const recent = StorageUtil.getRecentWallets()

    const filteredRecommended = WalletUtil.filterOutDuplicateWallets(recommended)
    const filteredFeatured = WalletUtil.filterOutDuplicateWallets(featured)

    const walletConnect = connectors.find(c => c.id === 'walletConnect')

    const multiChain = connectors.filter(connector => connector.type === 'MULTI_CHAIN')
    const announced = connectors.filter(connector => connector.type === 'ANNOUNCED')
    const injected = connectors.filter(connector => connector.type === 'INJECTED')
    const external = connectors.filter(connector => connector.type === 'EXTERNAL')

    return {
      custom,
      recent,
      external,
      multiChain,
      announced,
      injected,
      walletConnect,
      recommended: filteredRecommended,
      featured: filteredFeatured
    }
  },
  getConnectorRdns(explorerId: string) {
    return AssetController.state.connectorRdns[explorerId]
  }
}
