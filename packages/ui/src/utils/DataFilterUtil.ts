import type { Listing, MobileWallet } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl, CoreUtil, OptionsCtrl } from '@web3modal/core'
import type { TemplateResult } from 'lit'
import { InjectedId } from '../presets/EthereumPresets'
import { UiUtil } from './UiUtil'

export const DataFilterUtil = {
  allowedExplorerListings(listings: Listing[]) {
    const { explorerAllowList, explorerDenyList } = ConfigCtrl.state
    let filtered = [...listings]
    if (explorerAllowList?.length) {
      filtered = filtered.filter(l => explorerAllowList.includes(l.id))
    }
    if (explorerDenyList?.length) {
      filtered = filtered.filter(l => !explorerDenyList.includes(l.id))
    }

    return filtered
  },

  walletsWithInjected<T extends Listing | MobileWallet>(wallets?: T[]) {
    let filtered = [...(wallets ?? [])]

    if (window.ethereum) {
      const injectedName = UiUtil.getWalletName('')
      filtered = filtered.filter(({ name }) => !UiUtil.caseSafeIncludes(name, injectedName))
    }

    return filtered
  },

  connectorWallets() {
    const { isStandalone } = OptionsCtrl.state
    if (isStandalone) {
      return []
    }
    let connectors = ClientCtrl.client().getConnectors()
    if (!window.ethereum && CoreUtil.isMobile()) {
      connectors = connectors.filter(({ id }) => id !== 'injected' && id !== InjectedId.metaMask)
    }

    return connectors
  },

  walletTemplatesWithRecent(
    walletsTemplate: TemplateResult<1>[],
    recentTemplate?: TemplateResult<1>
  ) {
    let wallets = [...walletsTemplate]
    if (recentTemplate) {
      const recentWallet = UiUtil.getRecentWallet()
      wallets = wallets.filter(wallet => !wallet.values.includes(recentWallet?.name))
      wallets.splice(1, 0, recentTemplate)
    }

    return wallets
  },

  deduplicateExplorerListingsFromConnectors(listings: Listing[]) {
    const { isStandalone } = OptionsCtrl.state
    if (isStandalone) {
      return listings
    }
    const connectors = ClientCtrl.client().getConnectors()
    const connectorNames = connectors.map(({ name }) => name.toUpperCase())

    return listings.filter(({ name }) => !connectorNames.includes(name.toUpperCase()))
  }
}
