import type { Connector } from '@web3modal/core'
import { ConnectorController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribe('connectors', connectors => (this.connectors = connectors))
    )
  }

  public disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="xs">
        ${this.connectorsTemplate()}
        <wui-list-wallet name="View All" showAllWallets></wui-list-wallet>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private connectorsTemplate() {
    return this.connectors.map(
      connector =>
        html`<wui-list-wallet
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnectorClick(connector)}
        ></wui-list-wallet>`
    )
  }

  private onConnectorClick(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      RouterController.push('ConnectingWalletConnect', { connector })
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
