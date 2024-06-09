import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { state } from 'lit/decorators/state.js'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  type Connector
} from '@web3modal/core'
import { ifDefined } from 'lit/directives/if-defined.js'

// -- Constants ----------------------------------------- //
const chainNameMap = {
  evm: 'Ethereum',
  solana: 'Solana'
}

const chainImageIdMap = {
  evm: '692ed6ba-e569-459a-556a-776476829e00',
  solana: 'a1b58899-f671-4276-6a5e-56ca5bd59700'
}

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
          <wui-text variant="paragraph-500" align="center" color="fg-100">
            Select Chain for ${this.name}
          </wui-text>
          <wui-text variant="small-400" align="center" color="fg-200">
            Select which chain to connect to your multi chain wallet
          </wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="xs" wid>
          ${connectors.map(
            connector =>
              html`<wui-list-wallet
                imageSrc=${ifDefined(AssetUtil.getChainImage(chainImageIdMap[connector.chain]))}
                name=${chainNameMap[connector.chain]}
                @click=${() => this.onSelectChain(connector)}
                tagVariant="main"
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
  private onSelectChain(connector: Connector) {
    if (connector.chain && ChainController.state.activeChain !== connector.chain) {
      ChainController.switchChain(connector.chain)
    } else if (!ChainController.state.activeCaipNetwork) {
      ChainController.setActiveChain(connector.chain)
    }

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
