/* eslint-disable no-console */
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipNetworkId } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-button'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-network-image'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import { PayController } from '../../controllers/PayController.js'
import { isPayWithWalletSupported } from '../../utils/AssetUtil.js'
import styles from './styles.js'

@customElement('w3m-pay-view')
export class W3mPayView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private amount = ''
  @state() private tokenSymbol = ''
  @state() private networkName = ''
  @state() private exchanges = PayController.state.exchanges
  @state() private isLoading = PayController.state.isLoading
  @state() private loadingExchangeId: string | null = null
  @state() private connectedWalletInfo = ChainController.getAccountData()?.connectedWalletInfo

  public constructor() {
    super()
    this.initializePaymentDetails()
    this.unsubscribe.push(PayController.subscribeKey('exchanges', val => (this.exchanges = val)))
    this.unsubscribe.push(PayController.subscribeKey('isLoading', val => (this.isLoading = val)))
    this.unsubscribe.push(
      ChainController.subscribeChainProp('accountState', val => {
        this.connectedWalletInfo = val?.connectedWalletInfo
      })
    )

    PayController.fetchExchanges()
  }

  // -- Computed Properties ------------------------------ //
  /**
   * Check if wallet is connected based on active address
   */
  private get isWalletConnected(): boolean {
    const accountData = ChainController.getAccountData()

    return accountData?.status === 'connected'
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const} gap="3">
          ${this.renderPaymentHeader()}

          <wui-flex flexDirection="column" gap="3">
            ${this.renderPayWithWallet()} ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private initializePaymentDetails() {
    const paymentAsset = PayController.getPaymentAsset()
    this.networkName = paymentAsset.network
    this.tokenSymbol = paymentAsset.metadata.symbol
    this.amount = PayController.state.amount.toString()
  }

  private renderPayWithWallet() {
    if (!isPayWithWalletSupported(this.networkName as CaipNetworkId)) {
      return html``
    }

    return html`<wui-flex flexDirection="column" gap="3">
        ${this.isWalletConnected ? this.renderConnectedView() : this.renderDisconnectedView()}
      </wui-flex>
      <wui-separator text="or"></wui-separator>`
  }

  private renderPaymentHeader() {
    let displayNetworkName = this.networkName
    if (this.networkName) {
      const allNetworks = ChainController.getAllRequestedCaipNetworks()
      const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.networkName)
      if (targetNetwork) {
        displayNetworkName = targetNetwork['name']
      }
    }

    return html`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-flex alignItems="center" gap="2">
          <wui-text variant="h1-regular" color="primary">${this.amount || '0.0000'}</wui-text>
          <wui-flex class="token-display" alignItems="center" gap="1">
            <wui-text variant="md-medium" color="primary">
              ${this.tokenSymbol || 'Unknown Asset'}
            </wui-text>
            ${displayNetworkName
              ? html`
                  <wui-text variant="sm-medium" color="secondary">
                    on ${displayNetworkName}
                  </wui-text>
                `
              : ''}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private renderConnectedView() {
    const walletName = this.connectedWalletInfo?.name || 'connected wallet'

    return html`
      <wui-list-item
        @click=${this.onWalletPayment}
        ?chevron=${true}
        ?fullSize=${true}
        ?rounded=${true}
        data-testid="wallet-payment-option"
        imageSrc=${ifDefined(this.connectedWalletInfo?.icon)}
      >
        <wui-text variant="lg-regular" color="primary">Pay with ${walletName}</wui-text>
      </wui-list-item>

      <wui-list-item
        icon="power"
        ?rounded=${true}
        iconColor="error"
        @click=${this.onDisconnect}
        data-testid="disconnect-button"
        ?chevron=${false}
      >
        <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
      </wui-list-item>
    `
  }

  private renderDisconnectedView() {
    return html`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      icon="wallet"
      ?rounded=${true}
      @click=${this.onWalletPayment}
      ?chevron=${true}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay from wallet</wui-text>
    </wui-list-item>`
  }

  private renderExchangeOptions() {
    if (this.isLoading) {
      return html`<wui-flex justifyContent="center" alignItems="center">
        <wui-spinner size="md"></wui-spinner>
      </wui-flex>`
    }
    if (this.exchanges.length === 0) {
      return html`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`
    }

    return this.exchanges.map(
      exchange => html`
        <wui-list-item
          @click=${() => this.onExchangePayment(exchange.id)}
          data-testid="exchange-option-${exchange.id}"
          ?chevron=${true}
          ?disabled=${this.loadingExchangeId !== null}
          ?loading=${this.loadingExchangeId === exchange.id}
          imageSrc=${ifDefined(exchange.imageUrl)}
        >
          <wui-flex alignItems="center" gap="3">
            <wui-text flexGrow="1" variant="md-medium" color="primary"
              >Pay with ${exchange.name} <wui-spinner size="sm" color="secondary"></wui-spinner
            ></wui-text>
          </wui-flex>
        </wui-list-item>
      `
    )
  }

  private onWalletPayment() {
    PayController.handlePayWithWallet()
  }

  private async onExchangePayment(exchangeId: string) {
    try {
      this.loadingExchangeId = exchangeId
      const result = await PayController.handlePayWithExchange(exchangeId)
      if (result) {
        await ModalController.open({
          view: 'PayLoading'
        })
        CoreHelperUtil.openHref(result.url, result.openInNewTab ? '_blank' : '_self')
      }
    } catch (error) {
      console.error('Failed to pay with exchange', error)
      SnackController.showError('Failed to pay with exchange')
    } finally {
      this.loadingExchangeId = null
    }
  }

  private async onDisconnect(e: Event) {
    e.stopPropagation()
    try {
      await ConnectionController.disconnect()
    } catch {
      console.error('Failed to disconnect')
      SnackController.showError('Failed to disconnect')
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-view': W3mPayView
  }
}
