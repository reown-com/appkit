import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-controllers'
import {
  AssetController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

@customElement('w3m-connect-walletconnect-widget')
export class W3mConnectWalletConnectWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private connectorImages = AssetController.state.connectorImages

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      AssetController.subscribeKey('connectorImages', val => (this.connectorImages = val))
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

    const connectorImage = connector.imageUrl || this.connectorImages[connector?.imageId ?? '']

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

    return html`
      <w3m-list-wallet
        imageSrc=${ifDefined(connectorImage)}
        name=${connector.name ?? 'Unknown'}
        @click=${() => this.onConnector(connector)}
        tagLabel="qr code"
        tagVariant="accent"
        tabIdx=${ifDefined(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
        size="sm"
        ?disabled=${hasWcConnection}
        rdnsId=${connector.explorerWallet?.rdns}
      >
      </w3m-list-wallet>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    ConnectorController.setActiveConnector(connector)
    RouterController.push('ConnectingWalletConnect', {
      redirectView: RouterController.state.data?.redirectView
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-walletconnect-widget': W3mConnectWalletConnectWidget
  }
}
