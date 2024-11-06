import type { WcWallet } from '@reown/appkit-core'
import {
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
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
    const recent = StorageUtil.getRecentWallets()

    if (!recent?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${recent.map(
          wallet => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              ?loading=${this.loading}
              tagLabel="recent"
              tagVariant="shade"
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
    RouterController.push('ConnectingWalletConnect', { wallet })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recent-widget': W3mConnectRecentWidget
  }
}
