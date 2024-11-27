import type { Connector } from '@reown/appkit-core'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-walletconnect-widget')
export class W3mConnectWalletConnectWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

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
    if (CoreHelperUtil.isMobile()) {
      this.style.cssText = `display: none`

      return null
    }

    const connector = this.connectors.find(c => c.id === 'walletConnect')

    if (!connector) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-list-wallet
        imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
        name=${connector.name ?? 'Unknown'}
        @click=${() => this.onConnector(connector)}
        tagLabel="qr code"
        tagVariant="main"
        tabIdx=${ifDefined(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
      >
      </wui-list-wallet>
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
    'w3m-connect-walletconnect-widget': W3mConnectWalletConnectWidget
  }
}
