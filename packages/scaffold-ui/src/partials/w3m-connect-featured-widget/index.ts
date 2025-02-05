import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { WcWallet } from '@reown/appkit-core'
import { ApiController, AssetUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { MobileWalletUtil } from '@reown/appkit-utils'

import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('w3m-connect-featured-widget')
export class W3mConnectFeaturedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { featured } = ApiController.state
    if (!featured.length) {
      this.style.cssText = `display: none`

      return null
    }

    const wallets = WalletUtil.filterOutDuplicateWallets(featured)

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${wallets.map(
          wallet => html`
            <wui-list-wallet
              data-testid=${`wallet-selector-featured-${wallet.id}`}
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
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
    MobileWalletUtil.handleMobileWalletRedirection(wallet)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-featured-widget': W3mConnectFeaturedWidget
  }
}
