import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { Connector } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

@customElement('w3m-connect-announced-widget')
export class W3mConnectAnnouncedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private connections = ConnectionController.state.connections

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
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
      <wui-flex flexDirection="column" gap="xs">
        ${announcedConnectors.filter(ConnectorUtil.showConnector).map(connector => {
          const connectionsByNamespace = this.connections.get(connector.chain) ?? []
          const isAlreadyConnected = connectionsByNamespace.some(c =>
            HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)
          )

          return html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
              name=${connector.name ?? 'Unknown'}
              @click=${() => this.onConnector(connector)}
              tagVariant=${isAlreadyConnected ? 'shade' : 'success'}
              tagLabel=${isAlreadyConnected ? 'connected' : 'installed'}
              data-testid=${`wallet-selector-${connector.id}`}
              .installed=${true}
              tabIdx=${ifDefined(this.tabIdx)}
            >
            </wui-list-wallet>
          `
        })}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    if (connector.id === 'walletConnect') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect')
      }
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-announced-widget': W3mConnectAnnouncedWidget
  }
}
