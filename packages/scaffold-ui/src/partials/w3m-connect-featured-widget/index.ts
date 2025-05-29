import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-controllers'
import { AssetUtil, ConnectionController, ConnectorController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'

@customElement('w3m-connect-featured-widget')
export class W3mConnectFeaturedWidget extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @property() public wallets: WcWallet[] = []

  @state() private connections = ConnectionController.state.connections

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    const hasConnection = Array.from(this.connections.values())
      .flatMap(connections => connections)
      .some(({ connectorId }) => connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${this.wallets.map(
          wallet => html`
            <wui-list-wallet
              data-testid=${`wallet-selector-featured-${wallet.id}`}
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              tabIdx=${ifDefined(this.tabIdx)}
              ?disabled=${hasConnection}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    ConnectorController.selectWalletConnector(wallet)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-featured-widget': W3mConnectFeaturedWidget
  }
}
