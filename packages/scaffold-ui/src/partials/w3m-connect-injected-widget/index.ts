import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'

import type { Connector, ConnectorWithProviders } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

@customElement('w3m-connect-injected-widget')
export class W3mConnectInjectedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public tabIdx?: number

  @property({ attribute: false }) public connectors: ConnectorWithProviders[] = []

  @state() private connections = ConnectionController.state.connections

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectionController.subscribeKey('connections', val => (this.connections = val))
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const injectedConnectors = ConnectorUtil.sortConnectorsByExplorerWallet(
      this.connectors.filter(ConnectorUtil.showConnector)
    )

    if (injectedConnectors.length === 0) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="2">
        ${repeat(
          injectedConnectors,
          connector => connector.id,
          connector => {
            const connectionsByNamespace = this.connections.get(connector.chain) ?? []
            const isAlreadyConnected = connectionsByNamespace.some(c =>
              HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)
            )

            return html`
              <w3m-list-wallet
                imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
                .installed=${true}
                name=${connector.name ?? 'Unknown'}
                tagVariant=${isAlreadyConnected ? 'info' : 'success'}
                tagLabel=${isAlreadyConnected ? 'connected' : 'installed'}
                data-testid=${`wallet-selector-${connector.id}`}
                size="sm"
                @click=${() => this.onConnector(connector)}
                tabIdx=${ifDefined(this.tabIdx)}
                rdnsId=${ifDefined(connector.explorerWallet?.rdns || undefined)}
                walletRank=${ifDefined(connector.explorerWallet?.order)}
              >
              </w3m-list-wallet>
            `
          }
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    ConnectorController.setActiveConnector(connector)
    RouterController.push('ConnectingExternal', {
      connector,
      redirectView: RouterController.state.data?.redirectView,
      wallet: connector.explorerWallet
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-injected-widget': W3mConnectInjectedWidget
  }
}
