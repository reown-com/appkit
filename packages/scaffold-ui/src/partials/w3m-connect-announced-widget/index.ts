import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'

import type { Connector } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

@customElement('w3m-connect-announced-widget')
export class W3mConnectAnnouncedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public tabIdx?: number

  @property({ attribute: false }) public connectors: Connector[] = []

  @state() private connections = ConnectionController.state.connections

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectionController.subscribeKey('connections', val => (this.connections = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const announcedConnectors = this.connectors.filter(connector => connector.type === 'ANNOUNCED')

    if (!announcedConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="2">
        ${repeat(
          announcedConnectors.filter(ConnectorUtil.showConnector),
          connector => connector.id,
          connector => {
            const connectionsByNamespace = this.connections.get(connector.chain) ?? []
            const isAlreadyConnected = connectionsByNamespace.some(c =>
              HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)
            )

            return html`
              <w3m-list-wallet
                imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
                name=${connector.name ?? 'Unknown'}
                @click=${() => this.onConnector(connector)}
                tagVariant=${isAlreadyConnected ? 'info' : 'success'}
                tagLabel=${isAlreadyConnected ? 'connected' : 'installed'}
                size="sm"
                data-testid=${`wallet-selector-${connector.id}`}
                .installed=${true}
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
    const redirectView = RouterController.state.data?.redirectView

    if (connector.id === 'walletConnect') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect', { redirectView })
      }
    } else {
      RouterController.push('ConnectingExternal', {
        connector,
        redirectView,
        wallet: connector.explorerWallet
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-announced-widget': W3mConnectAnnouncedWidget
  }
}
