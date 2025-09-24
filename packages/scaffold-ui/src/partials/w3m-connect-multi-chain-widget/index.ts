import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { Connector, ConnectorWithProviders } from '@reown/appkit-controllers'
import { AssetUtil, ConnectorController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

@customElement('w3m-connect-multi-chain-widget')
export class W3mConnectMultiChainWidget extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @property() public connectors: ConnectorWithProviders[] = []

  public constructor() {
    super()
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

    const sortedConnectors = ConnectorUtil.sortConnectorsByExplorerWallet(multiChainConnectors)

    return html`
      <wui-flex flexDirection="column" gap="2">
        ${sortedConnectors.map(
          connector => html`
            <w3m-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
              .installed=${true}
              name=${connector.name ?? 'Unknown'}
              tagVariant="info"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${connector.id}`}
              size="sm"
              @click=${() => this.onConnector(connector)}
              tabIdx=${ifDefined(this.tabIdx)}
              rdnsId=${ifDefined(connector.explorerWallet?.rdns || undefined)}
              walletRank=${ifDefined(connector.explorerWallet?.order)}
            >
            </w3m-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    ConnectorController.setActiveConnector(connector)
    RouterController.push('ConnectingMultiChain', {
      redirectView: RouterController.state.data?.redirectView
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-multi-chain-widget': W3mConnectMultiChainWidget
  }
}
