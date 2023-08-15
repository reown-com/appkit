import type { Connector } from '@web3modal/core'
import { ApiController, ConnectorController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private images = ApiController.state.images

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
    const walletImages = Object.values(this.images).map(src => ({ src }))

    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.connectorsTemplate()}
        <wui-list-wallet
          name="All Wallets"
          showAllWallets
          .walletImages=${walletImages}
          @click=${this.onAllWallets.bind(this)}
        ></wui-list-wallet>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private connectorsTemplate() {
    return this.connectors.map(
      connector =>
        html`<wui-list-wallet
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
        ></wui-list-wallet>`
    )
  }

  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      RouterController.push('ConnectingWalletConnect', { connector })
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }

  private onAllWallets() {
    RouterController.push('AllWallets')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
