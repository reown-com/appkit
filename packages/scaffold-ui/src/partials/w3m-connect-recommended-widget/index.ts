import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { WcWallet } from '@reown/appkit-core'
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'

import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('w3m-connect-recommended-widget')
export class W3mConnectRecommendedWidget extends LitElement {
  // -- Members ------------------------------------------- //

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors
  @state() private loading = false
  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loading = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loading = !val))
      )
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const connector = this.connectors.find(c => c.id === 'walletConnect')
    if (!connector) {
      return null
    }
    const { recommended } = ApiController.state
    const { customWallets, featuredWalletIds } = OptionsController.state
    const { connectors } = ConnectorController.state
    const recent = StorageUtil.getRecentWallets()

    const injected = connectors.filter(
      c => c.type === 'INJECTED' || c.type === 'ANNOUNCED' || c.type === 'MULTI_CHAIN'
    )

    const injectedWallets = injected.filter(i => i.name !== 'Browser Wallet')

    if (featuredWalletIds || customWallets || !recommended.length) {
      this.style.cssText = `display: none`

      return null
    }

    const overrideLength = injectedWallets.length + recent.length

    const maxRecommended = Math.max(0, 2 - overrideLength)
    const wallets = WalletUtil.filterOutDuplicateWallets(recommended).slice(0, maxRecommended)

    if (!wallets.length) {
      this.style.cssText = `display: none`

      return null
    }

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
