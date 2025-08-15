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
      <wui-flex flexDirection="column" .padding=${['0', 's', 'xl', 's'] as const} gap="xs">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
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
      <wui-list-description
        @click=${this.onBuyCrypto.bind(this)}
        text="Buy crypto"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        data-testid="wallet-features-onramp-button"
      ></wui-list-description>
    `
  }

  private depositFromExchangeTemplate() {
    if (!this.namespace) {
      return null
    }

    const isPayWithExchangeEnabled =
      this.remoteFeatures?.payWithExchange &&
      CoreConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace)

    if (!isPayWithExchangeEnabled) {
      return null
    }

    return html`
      <wui-list-description
        @click=${this.onDepositFromExchange.bind(this)}
        text="Deposit from exchange"
        icon="download"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="wallet-features-deposit-from-exchange-button"
      ></wui-list-description>
    `
  }

  private receiveTemplate() {
    const isReceiveEnabled = Boolean(this.features?.receive)

    if (!isReceiveEnabled) {
      return null
    }

    return html`
      <wui-list-description
        @click=${this.onReceive.bind(this)}
        text="Receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="wallet-features-receive-button"
      ></wui-list-description>
    `
  }

  private onBuyCrypto() {
    RouterController.push('OnRampProviders')
  }

  private onReceive() {
    RouterController.push('WalletReceive')
  }

  private onDepositFromExchange() {
    RouterController.push('PayWithExchange')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-fund-wallet-view': W3mFundWalletView
  }
}
