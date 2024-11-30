import type { WcWallet } from '@reown/appkit-core'
import { ApiController, AssetUtil, ConnectorController, RouterController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { WalletUtil } from '../../utils/WalletUtil.js'

@customElement('w3m-connect-featured-widget')
export class W3mConnectFeaturedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //

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
      ${wallets.map(
        wallet => html`
          <wui-list-select-wallet
            imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
            name=${wallet.name ?? 'Unknown'}
            variant="primary"
            @click=${() => this.onConnectWallet(wallet)}
          ></wui-list-select-wallet>
        `
      )}
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
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
    'w3m-connect-featured-widget': W3mConnectFeaturedWidget
  }
}
