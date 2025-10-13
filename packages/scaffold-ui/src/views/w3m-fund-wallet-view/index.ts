import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  ConstantsUtil as CoreConstantsUtil,
  ExchangeController,
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
  @state() private activeCaipNetwork = ChainController.state.activeCaipNetwork
  @state() private features = OptionsController.state.features
  @state() private remoteFeatures = OptionsController.state.remoteFeatures
  @state() private exchangesLoading = ExchangeController.state.isLoading
  @state() private exchanges = ExchangeController.state.exchanges
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        OptionsController.subscribeKey('features', val => (this.features = val)),
        OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.activeCaipNetwork = val
          this.setDefaultPaymentAsset()
        }),
        ExchangeController.subscribeKey('isLoading', val => (this.exchangesLoading = val)),
        ExchangeController.subscribeKey('exchanges', val => (this.exchanges = val))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override async firstUpdated() {
    const isPayWithExchangeSupported = ExchangeController.isPayWithExchangeSupported()
    if (isPayWithExchangeSupported) {
      await this.setDefaultPaymentAsset()
      await ExchangeController.fetchExchanges()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['1', '3', '3', '3'] as const} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private async setDefaultPaymentAsset() {
    if (!this.activeCaipNetwork) {
      return
    }

    const assets = await ExchangeController.getAssetsForNetwork(
      this.activeCaipNetwork.caipNetworkId
    )
    const usdc = assets.find(asset => asset.metadata.symbol === 'USDC') || assets[0]
    if (usdc) {
      ExchangeController.setPaymentAsset(usdc)
    }
  }
  private onrampTemplate() {
    if (!this.activeCaipNetwork) {
      return null
    }

    const isOnrampEnabled = this.remoteFeatures?.onramp
    const hasNetworkSupport = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(
      this.activeCaipNetwork.chainNamespace
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

  private depositFromExchangeTemplate() {
    if (!this.activeCaipNetwork) {
      return null
    }

    const isPayWithExchangeSupported = ExchangeController.isPayWithExchangeSupported()
    if (!isPayWithExchangeSupported) {
      return null
    }

    return html`
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading || !this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
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

  private onDepositFromExchange() {
    RouterController.push('PayWithExchange', {
      redirectView: RouterController.state.data?.redirectView
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-fund-wallet-view': W3mFundWalletView
  }
}
