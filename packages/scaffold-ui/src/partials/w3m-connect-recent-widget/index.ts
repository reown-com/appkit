import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { WcWallet } from '@reown/appkit-core'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private loading = false

  // -- Lifecycle ----------------------------------------- //
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

  // -- Render -------------------------------------------- //
  public override render() {
    const recentWallets = StorageUtil.getRecentWallets()
    const filteredRecentWallets = recentWallets.filter(
      wallet =>
        !this.connectors.some(
          connector => connector.id === wallet.id || connector.name === wallet.name
        )
    )

    if (!filteredRecentWallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${filteredRecentWallets.map(
          wallet => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              tagLabel="recent"
              tagVariant="shade"
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

    ConnectorController.selectWalletConnector(wallet)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recent-widget': W3mConnectRecentWidget
  }
}
