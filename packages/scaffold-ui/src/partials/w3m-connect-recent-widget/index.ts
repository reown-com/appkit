import type { WcWallet } from '@reown/appkit-core'
import { AssetUtil, RouterController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

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
              tagLabel="recent"
              tagVariant="shade"
              tabIdx=${ifDefined(this.tabIdx)}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    RouterController.push('ConnectingWalletConnect', { wallet })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recent-widget': W3mConnectRecentWidget
  }
}
