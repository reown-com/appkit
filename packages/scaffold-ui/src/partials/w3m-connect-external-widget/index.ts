import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

@customElement('w3m-connect-external-widget')
export class W3mConnectExternalWidget extends LitElement {
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
    const externalConnectors = this.connectors.filter(connector => connector.type === 'EXTERNAL')
    const filteredOutExcludedConnectors = externalConnectors.filter(ConnectorUtil.showConnector)
    const filteredOutCoinbaseConnectors = filteredOutExcludedConnectors.filter(
      connector => connector.id !== CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK
    )

    if (!filteredOutCoinbaseConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

    return html`
      <wui-flex flexDirection="column" gap="2">
        ${filteredOutCoinbaseConnectors.map(
          connector => html`
            <w3m-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
              .installed=${true}
              name=${connector.name ?? 'Unknown'}
              data-testid=${`wallet-selector-external-${connector.id}`}
              size="sm"
              @click=${() => this.onConnector(connector)}
              tabIdx=${ifDefined(this.tabIdx)}
              ?disabled=${hasWcConnection}
              rdnsId=${connector.explorerWallet?.rdns}
              walletRank=${connector.explorerWallet?.order}
            >
            </w3m-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    RouterController.push('ConnectingExternal', {
      connector,
      redirectView: RouterController.state.data?.redirectView
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-external-widget': W3mConnectExternalWidget
  }
}
