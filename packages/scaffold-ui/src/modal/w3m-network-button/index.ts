import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetController,
  AssetUtil,
  ChainController,
  EventsController,
  ModalController,
  OptionsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-network-button'

import styles from './styles.js'

class W3mNetworkButtonBase extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @property({ type: String }) public label?: string

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private networkImage = AssetUtil.getNetworkImage(this.network)

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private loading = ModalController.state.loading

  // eslint-disable-next-line no-nested-ternary
  @state() private isSupported = OptionsController.state.allowUnsupportedChain
    ? true
    : ChainController.state.activeChain
      ? ChainController.checkIfSupportedNetwork(ChainController.state.activeChain)
      : true

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = AssetUtil.getNetworkImage(this.network)
        }),
        ChainController.subscribeKey('activeCaipAddress', val => {
          this.caipAddress = val
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.network = val
          this.networkImage = AssetUtil.getNetworkImage(val)
          this.isSupported = val?.chainNamespace
            ? ChainController.checkIfSupportedNetwork(val.chainNamespace)
            : true
          AssetUtil.fetchNetworkImage(val?.assets?.imageId)
        }),
        ModalController.subscribeKey('loading', val => (this.loading = val))
      ]
    )
  }

  public override firstUpdated() {
    AssetUtil.fetchNetworkImage(this.network?.assets?.imageId)
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const isSupported = this.network
      ? ChainController.checkIfSupportedNetwork(this.network.chainNamespace)
      : true

    return html`
      <wui-network-button
        .disabled=${Boolean(this.disabled || this.loading)}
        .isUnsupportedChain=${OptionsController.state.allowUnsupportedChain ? false : !isSupported}
        imageSrc=${ifDefined(this.networkImage)}
        @click=${this.onClick.bind(this)}
        data-testid="w3m-network-button"
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `
  }

  // -- Private ------------------------------------------- //
  private getLabel() {
    if (this.network) {
      if (!this.isSupported && !OptionsController.state.allowUnsupportedChain) {
        return 'Switch Network'
      }

      return this.network.name
    }

    if (this.label) {
      return this.label
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

@customElement('w3m-network-button')
export class W3mNetworkButton extends W3mNetworkButtonBase {}

@customElement('appkit-network-button')
export class AppKitNetworkButton extends W3mNetworkButtonBase {}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
    'appkit-network-button': AppKitNetworkButton
  }
}
