import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  AssetUtil,
  ChainController,
  ConnectionController,
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

        const shouldHandlePaymentInProgress =
          exchangeState.isPaymentInProgress &&
          exchangeState.currentPayment?.exchangeId &&
          exchangeState.currentPayment?.sessionId &&
          exchangeState.paymentId

        if (shouldHandlePaymentInProgress) {
          this.handlePaymentInProgress()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    ExchangeController.reset()
  }

  public override firstUpdated() {
    ExchangeController.fetchExchanges()
    ExchangeController.fetchTokenPrice()

    if (this.network) {
      ExchangeController.setPaymentAsset({
        network: `${this.network.chainNamespace}:${this.network.id}`,
        asset: 'native',
        metadata: {
          name: this.network.nativeCurrency.name,
          symbol: this.network.nativeCurrency.symbol,
          decimals: this.network.nativeCurrency.decimals
        }
      })
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="2" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private exchangesTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        gap="2"
        .padding=${['3', '3', '3', '3'] as const}
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
              <wui-text variant="md-regular" color="secondary">
                Deposit from ${exchange.name}
              </wui-text>
            </wui-list-item>`
        )}
      </wui-flex>
    `
  }
  private amountInputTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="3" .padding=${['0', '3', '3', '3'] as const} class="amount-input-container">
        <wui-flex justifyContent="space-between" alignItems="center">
          <wui-text variant="md-medium" color="secondary">Asset</wui-text>

          <wui-token-button
            data-testid="deposit-from-exchange-asset-button"
            flexDirection="row-reverse"
            text=${this.network?.nativeCurrency.symbol || ''}
            imageSrc=${AssetUtil.getNetworkImage(this.network) || ''}
            >
          </wui-token-button>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" justifyContent="center">
          <wui-flex alignItems="center" gap="1">
            <wui-text variant="h2-regular" color="secondary">${this.amount}</wui-text>
            <wui-text variant="md-regular" color="secondary">USD</wui-text>
          </wui-flex>
          ${this.tokenAmountTemplate()}
          </wui-flex>
          <wui-flex justifyContent="space-between" gap="2">
            ${PRESET_AMOUNTS.map(amount => html`<wui-button @click=${() => this.onPresetAmountClick(amount)} variant=${this.amount === amount ? 'neutral-primary' : 'neutral-secondary'} size="sm" fullWidth>$${amount}</wui-button>`)}
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
      <wui-text variant="md-regular" color="secondary">
        ${this.tokenAmount} ${this.network?.nativeCurrency.symbol}
      </wui-text>
    `
  }

  private async onExchangeClick(exchange: Exchange) {
    if (this.amount) {
      await ExchangeController.handlePayWithExchange(exchange.id)
    }
  }

  private handlePaymentInProgress() {
    const namespace = ChainController.state.activeChain

    if (
      this.isPaymentInProgress &&
      this.currentPayment?.exchangeId &&
      this.currentPayment?.sessionId &&
      this.paymentId
    ) {
      SnackController.showLoading('Deposit in progress...')
      RouterController.replace('Account')
      ExchangeController.waitUntilComplete({
        exchangeId: this.currentPayment.exchangeId,
        sessionId: this.currentPayment.sessionId,
        paymentId: this.paymentId
      }).then(status => {
        if (status.status === 'SUCCESS') {
          SnackController.showSuccess('Deposit completed')

          if (namespace) {
            ConnectionController.updateBalance(namespace)
          }
        } else if (status.status === 'FAILED') {
          SnackController.showError('Deposit failed')
        }
      })
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
