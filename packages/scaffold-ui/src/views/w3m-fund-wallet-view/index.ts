import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  ConstantsUtil as CoreConstantsUtil,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

@customElement('w3m-fund-wallet-view')
export class W3mFundWalletView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private namespace = ChainController.state.activeChain
  @state() private features = OptionsController.state.features
  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        OptionsController.subscribeKey('features', val => (this.features = val)),
        OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)),
        ChainController.subscribeKey('activeChain', val => (this.namespace = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          if (val?.chainNamespace) {
            this.namespace = val?.chainNamespace
          }
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['1', '3', '3', '3'] as const} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onrampTemplate() {
    if (!this.namespace) {
      return null
    }

    const isOnrampEnabled = this.remoteFeatures?.onramp
    const hasNetworkSupport = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(
      this.namespace
    )

    if (!isOnrampEnabled || !hasNetworkSupport) {
      return null
    }

    return html`
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `
  }

  private receiveTemplate() {
    const isReceiveEnabled = Boolean(this.features?.receive)

    if (!isReceiveEnabled) {
      return null
    }

    return html`
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `
  }

  private onBuyCrypto() {
    RouterController.push('OnRampProviders')
  }

  private onReceive() {
    RouterController.push('WalletReceive')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-fund-wallet-view': W3mFundWalletView
  }
}
