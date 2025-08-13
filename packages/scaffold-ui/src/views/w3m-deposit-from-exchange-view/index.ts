import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  AssetUtil,
  ChainController,
  type CurrentPayment,
  type Exchange,
  ExchangeController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

const PRESET_AMOUNTS = [10, 50, 100]

@customElement('w3m-deposit-from-exchange-view')
export class W3mDepositFromExchangeView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public network = ChainController.state.activeCaipNetwork
  @state() public exchanges = ExchangeController.state.exchanges
  @state() public isLoading = ExchangeController.state.isLoading
  @state() public amount = ExchangeController.state.amount
  @state() public tokenAmount = ExchangeController.state.tokenAmount
  @state() public priceLoading = ExchangeController.state.priceLoading
  @state() public isPaymentInProgress = ExchangeController.state.isPaymentInProgress
  @state() public currentPayment?: CurrentPayment = ExchangeController.state.currentPayment
  @state() public paymentId = ExchangeController.state.paymentId

  public constructor() {
    super()
    this.unsubscribe.push(
      ExchangeController.subscribe(exchangeState => {
        this.exchanges = exchangeState.exchanges
        this.isLoading = exchangeState.isLoading
        this.amount = exchangeState.amount
        this.tokenAmount = exchangeState.tokenAmount
        this.priceLoading = exchangeState.priceLoading
        this.paymentId = exchangeState.paymentId
        this.isPaymentInProgress = exchangeState.isPaymentInProgress
        this.currentPayment = exchangeState.currentPayment
        if (exchangeState.isPaymentInProgress) {
          this.handlePaymentInProgress()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    ExchangeController.fetchExchanges().catch()
    ExchangeController.fetchTokenPrice()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="xs" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private exchangesTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        gap="xs"
        .padding=${['xs', 's', 's', 's'] as const}
        class="exchanges-container"
      >
        ${this.exchanges.map(
          exchange =>
            html`<wui-list-item
              @click=${() => this.onExchangeClick(exchange)}
              chevron
              variant="image"
              imageSrc=${exchange.imageUrl}
              ?loading=${this.isLoading}
              ?disabled=${!this.amount}
            >
              <wui-text variant="paragraph-500" color="fg-200">
                Deposit from ${exchange.name}
              </wui-text>
            </wui-list-item>`
        )}
      </wui-flex>
    `
  }
  private amountInputTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="s" .padding=${['0', 's', 's', 's'] as const} class="amount-input-container">
        <wui-flex justifyContent="space-between">
          <wui-text variant="paragraph-500" color="fg-200">Asset</wui-text>
          <wui-chip-button
            data-testid="deposit-from-exchange-asset-button"
            text=${this.network?.nativeCurrency.symbol || ''}
            imageSrc=${AssetUtil.getNetworkImage(this.network)}
            size="sm"
            variant="gray"
            icon=${null}
          ></wui-chip-button>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" justifyContent="center">
          <wui-flex alignItems="center" gap="4xs">
            <wui-text variant="2xl-500" color="fg-200">${this.amount}</wui-text>
            <wui-text variant="paragraph-500" color="fg-200">USD</wui-text>
          </wui-flex>
          ${this.tokenAmountTemplate()}
          </wui-flex>
          <wui-flex justifyContent="space-between" gap="xs">
            ${PRESET_AMOUNTS.map(amount => html`<wui-button @click=${() => this.onPresetAmountClick(amount)} variant=${this.amount === amount ? 'accent' : 'shade'} size="sm" fullWidth>$${amount}</wui-button>`)}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private tokenAmountTemplate() {
    if (this.priceLoading) {
      return html`<wui-shimmer
        width="65px"
        height="20px"
        borderRadius="xxs"
        variant="light"
      ></wui-shimmer>`
    }

    return html`
      <wui-text variant="paragraph-500" color="fg-200">
        ${this.tokenAmount} ${this.network?.nativeCurrency.symbol}
      </wui-text>
    `
  }

  private async onExchangeClick(exchange: Exchange) {
    if (this.amount) {
      await ExchangeController.handlePayWithExchange(exchange.id)
    }
  }

  private async handlePaymentInProgress() {
    try {
      if (
        this.isPaymentInProgress &&
        this.currentPayment?.exchangeId &&
        this.currentPayment?.sessionId &&
        this.paymentId
      ) {
        SnackController.showLoading('Deposit in progress...')
        RouterController.replace('Account')
        const status = await ExchangeController.waitUntilComplete({
          exchangeId: this.currentPayment.exchangeId,
          sessionId: this.currentPayment.sessionId,
          paymentId: this.paymentId
        })
        if (status.status === 'SUCCESS') {
          SnackController.showSuccess('Deposit completed')
        } else if (status.status === 'FAILED') {
          SnackController.showError('Deposit failed')
        }
      }
    } catch (error) {
      SnackController.showError('Error fetching deposit status')
    } finally {
      ExchangeController.reset()
    }
  }

  private onPresetAmountClick(amount: number) {
    ExchangeController.setAmount(amount)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-deposit-from-exchange-view': W3mDepositFromExchangeView
  }
}
