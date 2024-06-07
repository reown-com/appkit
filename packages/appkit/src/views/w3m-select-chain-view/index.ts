import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { state } from 'lit/decorators/state.js'
import {
  AssetUtil,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  type Connector
} from '@web3modal/core'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-select-chain-view')
export class W3mSelectChainView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  protected readonly chainSelectConnectorName =
    RouterController.state.data?.chainSelectConnectorName

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  // -- State & Properties -------------------------------- //
  @state() private name = 'Phantom'

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
    const connectors = this.connectors.filter(
      connector => connector.name === this.chainSelectConnectorName
    )

    return html`
      <wui-flex
        flexDirection="column"
        gap="m"
        alignItems="center"
        .padding=${['3xs', 's', 's', 's']}
      >
        <wui-flex class="connector-image">
          <wui-image src=${AssetUtil.getConnectorImage(connectors[0])}></wui-image>
        </wui-flex>
        <wui-flex flexDirection="column" gap="xs">
          <wui-text variant="paragraph-500" align="center" color="fg-100"
            >Select Chain for ${this.name}</wui-text
          >
          <wui-text variant="small-400" align="center" color="fg-200">
            Select which chain to connect to your multi chain wallet
          </wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="xs" wid>
          ${connectors.map(
            connector =>
              html`<wui-list-wallet
                imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
                name=${connector.chain}
                @click=${() => this.onConnector(connector)}
                tagVariant="success"
                tagLabel="installed"
                data-testid=${`wallet-selector-${connector.id}`}
                .installed=${true}
              >
              </wui-list-wallet>`
          )}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect', {
          chainToConnect: connector.chain
        })
      }
    } else {
      RouterController.push('ConnectingExternal', { connector, chainToConnect: connector.chain })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-chain-view': W3mSelectChainView
  }
}
