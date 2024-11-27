import type { Connector } from '@reown/appkit-core'
import { ChainController, ConnectorController, RouterController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-qr-code-icon')
export class W3mQRCodeIcon extends LitElement {
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
    const connector = this.connectors.find(c => c.id === 'walletConnect')

    if (!connector) {
      return null
    }

    return html`
      <wui-icon
        color="accentPrimary"
        cursor="pointer"
        name="qrCodeBold"
        size="lg"
        @click=${() => this.onConnector(connector)}
      ></wui-icon>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    ChainController.setActiveConnector(connector)
    RouterController.push('ConnectingWalletConnect')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qr-code-icon': W3mQRCodeIcon
  }
}
