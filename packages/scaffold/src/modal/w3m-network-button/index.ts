import {
  AccountController,
  AssetController,
  ModalController,
  NetworkController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private networkImages = AssetController.state.networkImages

  @state() private network = NetworkController.state.caipNetwork

  @state() private connected = AccountController.state.isConnected

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        NetworkController.subscribeKey('caipNetwork', val => (this.network = val)),
        AccountController.subscribeKey('isConnected', val => (this.connected = val)),
        AssetController.subscribeNetworkImages(val => (this.networkImages = { ...val }))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const networkImage = this.networkImages[this.network?.imageId ?? '']

    return html`
      <wui-network-button imageSrc=${ifDefined(networkImage)} @click=${this.onClick.bind(this)}>
        ${this.network?.name ?? (this.connected ? 'Unknown Network' : 'Select Network')}
      </wui-network-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    ModalController.open({ view: 'Networks' })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
