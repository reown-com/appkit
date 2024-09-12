import {
  AccountController,
  AssetController,
  AssetUtil,
  EventsController,
  ModalController,
  NetworkController
} from '@rerock/appkit-core'
import type { WuiNetworkButton } from '@rerock/appkit-ui'
import { customElement } from '@rerock/appkit-ui'
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

  @property({ type: String }) public label?: string

  @state() private network = NetworkController.state.caipNetwork

  @state() private networkImage = this.network ? AssetUtil.getNetworkImage(this.network) : undefined

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  @state() private isUnsupportedChain = NetworkController.state.isUnsupportedChain

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.unsubscribe.push(
      ...[
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = this.network?.imageId
            ? AssetUtil.getNetworkImage(this.network)
            : undefined
        }),
        NetworkController.subscribeKey('caipNetwork', val => {
          this.network = val
          this.networkImage = val?.imageId ? AssetUtil.getNetworkImage(val) : undefined
        }),
        AccountController.subscribeKey('isConnected', val => (this.connected = val)),
        ModalController.subscribeKey('loading', val => (this.loading = val)),
        NetworkController.subscribeKey('isUnsupportedChain', val => (this.isUnsupportedChain = val))
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
        data-testid="wui-network-button"
        .disabled=${Boolean(this.disabled || this.loading)}
        .isUnsupportedChain=${this.isUnsupportedChain}
        imageSrc=${ifDefined(this.networkImage)}
        @click=${this.onClick.bind(this)}
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `
  }

  // -- Private ------------------------------------------- //
  private getLabel() {
    if (this.label) {
      return this.label
    }

    if (this.isUnsupportedChain) {
      return 'Switch Network'
    }
    if (this.network) {
      return this.network.name
    }
    if (this.connected) {
      return 'Unknown Network'
    }

    return 'Select Network'
  }

  private onClick() {
    if (!this.loading) {
      EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORKS' })
      ModalController.open({ view: 'Networks' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
