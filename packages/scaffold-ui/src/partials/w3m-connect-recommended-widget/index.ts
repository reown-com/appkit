import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'

import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('w3m-connect-recommended-widget')
export class W3mConnectRecommendedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @property() public wallets: WcWallet[] = []

  @state() private loading = false

  public constructor() {
    super()

    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loading = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loading = !val))
      )
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { connectors } = ConnectorController.state
    const { customWallets, featuredWalletIds } = OptionsController.state
    const recentWallets = StorageUtil.getRecentWallets()

    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    const injectedConnectors = connectors.filter(
      c => c.type === 'INJECTED' || c.type === 'ANNOUNCED' || c.type === 'MULTI_CHAIN'
    )
    const injectedWallets = injectedConnectors.filter(i => i.name !== 'Browser Wallet')

    if (!wcConnector) {
      return null
    }

    if (featuredWalletIds || customWallets || !this.wallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    const overrideLength = injectedWallets.length + recentWallets.length
    const maxRecommended = Math.max(0, 2 - overrideLength)
    const wallets = WalletUtil.filterOutDuplicateWallets(this.wallets).slice(0, maxRecommended)

    if (!wallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${wallets.map(
          wallet => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet?.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              tabIdx=${ifDefined(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${hasWcConnection}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    if (this.loading) {
      return
    }
    const connector = ConnectorController.getConnector(wallet.id, wallet.rdns)
    if (connector) {
      RouterController.push('ConnectingExternal', { connector })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recommended-widget': W3mConnectRecommendedWidget
  }
}
