import {
  AssetController,
  AssetUtil,
  ChainController,
  EventsController,
  ModalController,
  NetworkController
} from '@reown/appkit-core'
import type { WuiNetworkButton } from '@reown/appkit-ui'
import { customElement } from '@reown/appkit-ui'
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

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private networkImage = this.network ? AssetUtil.getNetworkImage(this.network) : undefined

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private loading = ModalController.state.loading

  @state() private isUnsupportedChain = NetworkController.state.isUnsupportedChain

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = this.network?.imageId
            ? AssetUtil.getNetworkImage(this.network)
            : undefined
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.network = val
          AssetController.getNetworkImage(val?.imageUrl, val?.imageId).then(image => {
            this.networkImage = image
          })
        }),
        ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val)),
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

    if (this.network) {
      return this.network.name
    }

    if (this.isUnsupportedChain) {
      return 'Unsupported Network'
    }

    if (this.caipAddress) {
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
