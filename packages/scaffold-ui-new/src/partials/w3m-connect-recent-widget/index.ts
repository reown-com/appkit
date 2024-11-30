import type { WcWallet } from '@reown/appkit-core'
import { AssetUtil, RouterController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-recent-widget')
export class W3mConnectRecentWidget extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    const recent = StorageUtil.getRecentWallets()

    if (!recent?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      ${recent.map(
        wallet => html`
          <wui-list-select-wallet
            imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
            name=${wallet.name ?? 'Unknown'}
            tagLabel="RECENT"
            tagVariant="accent"
            variant="primary"
            @click=${() => this.onConnectWallet(wallet)}
          ></wui-list-select-wallet>
        `
      )}
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
