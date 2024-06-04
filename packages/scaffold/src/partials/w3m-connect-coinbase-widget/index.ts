import type { Connector } from '@web3modal/core'
import { AssetUtil, ConnectorController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-coinbase-widget')
export class W3mConnectCoinbaseWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const coinbaseConnector = this.connectors.find(
      connector => connector.id === 'coinbaseWalletSDK'
    )

    if (!coinbaseConnector) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(coinbaseConnector))}
          .installed=${true}
          name=${ifDefined(coinbaseConnector.name)}
          data-testid=${`wallet-selector-${coinbaseConnector.id}`}
          @click=${() => this.onConnector(coinbaseConnector)}
        >
        </wui-list-wallet>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    RouterController.push('ConnectingExternal', { connector })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-coinbase-widget': W3mConnectCoinbaseWidget
  }
}
