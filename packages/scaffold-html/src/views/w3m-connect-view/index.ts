import type { Connector } from '@web3modal/core'
import { ConnectorController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    ConnectorController.subscribe('connectors', connectors => (this.connectors = connectors))
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="xs">
        ${this.connectorsTemplate()}
        <wui-list-select name="View All" showAllWallets></wui-list-select>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private connectorsTemplate() {
    return this.connectors.map(
      connector =>
        html`<wui-list-select
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnectorClick(connector)}
        ></wui-list-select>`
    )
  }

  private onConnectorClick(connector: Connector) {
    RouterController.push('Connecting', { connector })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
