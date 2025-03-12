import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { Connector } from '@reown/appkit-core'
import { AssetUtil, ConnectorController, RouterController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-wallet'

@customElement('w3m-connect-multi-chain-widget')
export class W3mConnectMultiChainWidget extends LitElement {
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
    const multiChainConnectors = this.connectors.filter(
      connector => connector.type === 'MULTI_CHAIN' && connector.name !== 'WalletConnect'
    )

    if (!multiChainConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${multiChainConnectors.map(
          connector => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
              .installed=${true}
              name=${connector.name ?? 'Unknown'}
              tagVariant="shade"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${connector.id}`}
              @click=${() => this.onConnector(connector)}
              tabIdx=${ifDefined(this.tabIdx)}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    ConnectorController.setActiveConnector(connector)
    RouterController.push('ConnectingMultiChain')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-multi-chain-widget': W3mConnectMultiChainWidget
  }
}
