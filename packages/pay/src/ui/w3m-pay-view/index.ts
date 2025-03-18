/* eslint-disable no-console */
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  AccountController,
  ConnectionController,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-button'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-network-image'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import { PayController } from '../../controllers/PayController.js'
import styles from './styles.js'

@customElement('w3m-pay-view')
export class W3mPayView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private amount = ''
  @state() private tokenSymbol = ''
  @state() private networkName = ''

  // -- Computed Properties ------------------------------ //
  /**
   * Check if wallet is connected based on active address
   */
  private get isWalletConnected(): boolean {
    return AccountController.state.status === 'connected'
  }

  // -- Lifecycle ----------------------------------------- //
  public override connectedCallback() {
    super.connectedCallback()
    this.initializePaymentDetails()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l']} gap="s">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-flex flexDirection="column" alignItems="center">
              <wui-flex alignItems="center" gap="xs">
                <wui-text variant="large-700" color="fg-100">${this.amount || '0.0000'}</wui-text>
                <wui-flex alignItems="center" gap="xxs" class="token-info">
                  <wui-text variant="paragraph-600" color="fg-100"
                    >${this.tokenSymbol || 'ETH'}</wui-text
                  >
                  ${this.networkName
                    ? html`
                        <wui-text variant="small-500" color="fg-200"
                          >on ${this.networkName}</wui-text
                        >
                      `
                    : ''}
                </wui-flex>
              </wui-flex>
            </wui-flex>
          </wui-flex>

          <wui-flex flexDirection="column" gap="s">
            <wui-flex class="payment-actions" justifyContent="space-between" alignItems="center">
              <wui-flex
                class="payment-option"
                justifyContent="space-between"
                alignItems="center"
                @click=${this.onWalletPayment}
              >
                <wui-flex alignItems="center" gap="s">
                  <wui-flex class="wallet-icons">
                    <wui-icon name="walletPlaceholder" size="md"></wui-icon>
                  </wui-flex>
                  <wui-text variant="paragraph-500" color="fg-100">Pay from wallet</wui-text>
                </wui-flex>
                ${this.isWalletConnected
                  ? ''
                  : html`<wui-icon name="chevronRight" color="fg-200" size="sm"></wui-icon>`}
              </wui-flex>

              ${this.isWalletConnected
                ? html`
                    <wui-icon-button
                      icon="close"
                      @click=${this.onDisconnect}
                      class="disconnect-button"
                    ></wui-icon-button>
                  `
                : ''}
            </wui-flex>

            <wui-separator text="or"></wui-separator>

            ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private getExchanges() {
    return PayController.getExchanges()
  }

  private initializePaymentDetails() {
    const paymentAsset = PayController.getPaymentAsset()
    this.networkName = paymentAsset.network
    this.tokenSymbol = paymentAsset.metadata.symbol

    if (paymentAsset.amount && paymentAsset.amount !== BigInt(0)) {
      try {
        const divisor = 10 ** paymentAsset.metadata.decimals
        this.amount = (Number(paymentAsset.amount) / divisor).toFixed(4)
      } catch (error) {
        this.amount = '0.0000'
      }
    }
  }

  private renderExchangeOptions() {
    const exchanges = this.getExchanges()

    return exchanges.map(
      exchange => html`
        <wui-flex
          class="payment-option exchange"
          justifyContent="space-between"
          alignItems="center"
          @click=${() => this.onExchangePayment(exchange.id)}
        >
          <wui-flex alignItems="center" gap="s">
            <wui-icon
              name="${exchange.id}"
              size="md"
              class="exchange-icon-${exchange.id}"
            ></wui-icon>
            <wui-text variant="paragraph-500" color="fg-100">Pay with ${exchange.name}</wui-text>
          </wui-flex>
        </wui-flex>
      `
    )
  }

  private onWalletPayment() {
    PayController.handlePayWithWallet()
  }

  private onExchangePayment(_exchangeId: string) {
    // Navigate to exchange payment flow
    RouterController.push('OnRampProviders')
  }

  private async onDisconnect(e: Event) {
    // Prevent the click from bubbling up to the parent
    e.stopPropagation()
    try {
      await ConnectionController.disconnect()
      PayController.setActiveAddress('')
      ModalController.close()
    } catch {
      SnackController.showError('Failed to disconnect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-view': W3mPayView
  }
}
