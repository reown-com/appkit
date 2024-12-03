import { html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { customElement } from '@reown/appkit-ui'
import {
  ConnectionController,
  ConnectorController,
  type Connector,
  ApiController,
  ModalController,
  type WcWallet,
  RouterController,
  AssetController,
  ChainController
} from '@reown/appkit-core'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { WalletUtil } from '../../utils/WalletUtil.js'

// -- Helpers --------------------------------------------- //
function selectConnector(connectors: Connector[], rdns: WcWallet['rdns']) {
  return connectors.find(c => c.id === rdns)
}

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() walletId = ''

  @state() private connectors = ConnectorController.state.connectors

  @state() private connecting = false

  @state() private caipAddress = ChainController.state.activeCaipAddress

  public constructor() {
    super()
    ApiController.state.prefetchPromise?.then(() => this.requestUpdate())
    RouterController.push('Connect')
    this.unsubscribe.push(
      ...[
        ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
        ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val)),
        ApiController.subscribeKey('prefetchPromise', val => {
          val?.then(() => this.requestUpdate())
        }),
        ModalController.subscribeKey('open', val => {
          if (!val) {
            this.connecting = false
            RouterController.push('Connect')
          }
        })
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return this.externalTemplate()
  }

  // -- Private ------------------------------------------- //
  private externalTemplate() {
    const wallet = WalletUtil.getWalletButton(this.walletId)

    if (!wallet) {
      return html`<wui-wallet-button></wui-wallet-button>`
    }

    const { injected, announced } = ConnectorUtil.getConnectorsByType(this.connectors)

    const connector = selectConnector([...injected, ...announced], wallet.rdns)

    if (!connector) {
      const imageSrc = wallet.image_id
        ? AssetController.state.walletImages[wallet.image_id]
        : undefined

      return html`
        <wui-wallet-button
          name=${wallet.name}
          .imageSrc=${ifDefined(imageSrc)}
          @click=${() => this.onConnect({ wallet })}
          ?connecting=${this.connecting}
          ?disabled=${Boolean(this.caipAddress)}
        ></wui-wallet-button>
      `
    }

    return html`
      <wui-wallet-button
        name=${connector.info?.name ?? connector.name}
        .imageSrc=${connector.info?.icon ?? connector.imageUrl}
        @click=${() => this.onConnect({ wallet, connector })}
        ?connecting=${this.connecting}
        ?disabled=${Boolean(this.caipAddress)}
      ></wui-wallet-button>
    `
  }

  private async onConnect({ connector, wallet }: { connector?: Connector; wallet: WcWallet }) {
    if (connector) {
      try {
        this.connecting = true
        await ConnectionController.connectExternal(connector, connector.chain)
      } catch {
        /* Ignore */
      } finally {
        this.connecting = false
      }
    } else {
      this.connecting = true
      ModalController.open({ view: 'ConnectingWalletConnect' })
      RouterController.push('ConnectingWalletConnect', wallet ? { wallet } : undefined)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
