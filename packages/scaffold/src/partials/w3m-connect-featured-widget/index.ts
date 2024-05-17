import type { WcWallet } from '@web3modal/core'
import { ApiController, AssetUtil, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-featured-widget')
export class W3mConnectFeaturedWidget extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    const { featured } = ApiController.state
    if (!featured.length) {
      this.style.cssText = `display: none`

      return null
    }

    const wallets = this.filterOutDuplicateWallets(featured)

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${wallets.map(
          wallet => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private filterOutDuplicateWallets(wallets: WcWallet[]) {
    // Implement duplicate wallet filtering logic
    return wallets
  }

  private onConnectWallet(wallet: WcWallet) {
    RouterController.push('ConnectingWalletConnect', { wallet })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-featured-widget': W3mConnectFeaturedWidget
  }
}
