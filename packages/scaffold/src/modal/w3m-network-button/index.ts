import { AccountController, AssetUtil, ModalController, NetworkController } from '@web3modal/core'
import type { WuiNetworkButton } from '@web3modal/ui'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: WuiNetworkButton['disabled'] = false

  @state() private network = NetworkController.state.caipNetwork

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        NetworkController.subscribeKey('caipNetwork', val => (this.network = val)),
        AccountController.subscribeKey('isConnected', val => (this.connected = val)),
        ModalController.subscribeKey('loading', val => (this.loading = val))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-network-button
        .disabled=${Boolean(this.disabled || this.loading)}
        imageSrc=${ifDefined(AssetUtil.getNetworkImage(this.network))}
        @click=${this.onClick.bind(this)}
      >
        ${this.network?.name ?? (this.connected ? 'Unknown Network' : 'Select Network')}
      </wui-network-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (!this.loading) {
      ModalController.open({ view: 'Networks' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
