import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

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
import '@reown/appkit-ui/wui-chip-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-fund-input/index.js'
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const PRESET_AMOUNTS = [10, 50, 100] as const
const MAX_DECIMALS = 6
const MAX_INTEGERS = 10

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
  @state() public paymentAsset = ExchangeController.state.paymentAsset

  public constructor() {
    super()
    this.unsubscribe.push(
      ChainController.subscribeKey('activeCaipNetwork', val => {
        this.network = val
        this.setDefaultPaymentAsset()
      }),
      ExchangeController.subscribe(exchangeState => {
        this.exchanges = exchangeState.exchanges
        this.isLoading = exchangeState.isLoading
        this.amount = exchangeState.amount
        this.tokenAmount = exchangeState.tokenAmount
        this.priceLoading = exchangeState.priceLoading
        this.paymentId = exchangeState.paymentId
        this.isPaymentInProgress = exchangeState.isPaymentInProgress
        this.currentPayment = exchangeState.currentPayment
        this.paymentAsset = exchangeState.paymentAsset

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
    const isInProgress = ExchangeController.state.isPaymentInProgress
    if (!isInProgress) {
      ExchangeController.reset()
    }
  }

  public override async firstUpdated() {
    await this.getPaymentAssets()

    if (!this.paymentAsset) {
      await this.setDefaultPaymentAsset()
    }
    ExchangeController.setAmount(PRESET_AMOUNTS[0])
    await ExchangeController.fetchExchanges()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `
  }

  private exchangesLoadingTemplate() {
    return Array.from({ length: 2 }).map(
      () => html`<wui-shimmer width="100%" height="65px" borderRadius="xxs"></wui-shimmer>`
    )
  }

  private _exchangesTemplate() {
    return this.exchanges.length > 0
      ? this.exchanges.map(
          exchange =>
            html`<wui-list-item
              @click=${() => this.onExchangeClick(exchange)}
              chevron
              variant="image"
              imageSrc=${exchange.imageUrl}
              ?loading=${this.isLoading}
            >
              <wui-text variant="md-regular" color="primary">
                Deposit from ${exchange.name}
              </wui-text>
            </wui-list-item>`
        )
      : html`<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
          <wui-text variant="lg-medium" align="center" color="primary">
            No exchanges support this asset on this network
          </wui-text>
        </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private exchangesTemplate() {
    return html`<wui-flex
      flexDirection="column"
      gap="2"
      .padding=${['3', '3', '3', '3'] as const}
      class="exchanges-container"
    >
      ${this.isLoading ? this.exchangesLoadingTemplate() : this._exchangesTemplate()}
    </wui-flex>`
  }

  private amountInputTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['0', '3', '3', '3'] as const}
        class="amount-input-container"
      >
        <wui-flex
          justifyContent="space-between"
          alignItems="center"
          .margin=${['0', '0', '6', '0'] as const}
        >
          <wui-text variant="md-medium" color="secondary">Asset</wui-text>
          <wui-token-button
            data-testid="deposit-from-exchange-asset-button"
            flexDirection="row-reverse"
            text=${this.paymentAsset?.metadata.symbol || ''}
            imageSrc=${this.paymentAsset?.metadata.iconUrl || ''}
            @click=${() => RouterController.push('PayWithExchangeSelectAsset')}
            size="lg"
            .chainImageSrc=${ifDefined(AssetUtil.getNetworkImage(this.network))}
          >
          </wui-token-button>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          .margin=${['0', '0', '4', '0'] as const}
        >
          <w3m-fund-input
            @inputChange=${this.onAmountChange.bind(this)}
            .amount=${this.amount}
            .maxDecimals=${MAX_DECIMALS}
            .maxIntegers=${MAX_INTEGERS}
          >
          </w3m-fund-input>
          ${this.tokenAmountTemplate()}
        </wui-flex>
        <wui-flex justifyContent="center" gap="2">
          ${PRESET_AMOUNTS.map(
            amount =>
              html`<wui-chip-button
                @click=${() => ExchangeController.setAmount(amount)}
                type="neutral"
                size="lg"
                text=${`$${amount}`}
              ></wui-chip-button>`
          )}
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
        ${this.tokenAmount.toFixed(4)} ${this.paymentAsset?.metadata.symbol}
      </wui-text>
    `
  }

  private async onExchangeClick(exchange: Exchange) {
    if (!this.amount) {
      SnackController.showError('Please enter an amount')

      return
    }

    await ExchangeController.handlePayWithExchange(exchange.id)
  }

  private handlePaymentInProgress() {
    const namespace = ChainController.state.activeChain
    const { redirectView = 'Account' } = RouterController.state.data ?? {}

    if (
      this.isPaymentInProgress &&
      this.currentPayment?.exchangeId &&
      this.currentPayment?.sessionId &&
      this.paymentId
    ) {
      ExchangeController.waitUntilComplete({
        exchangeId: this.currentPayment.exchangeId,
        sessionId: this.currentPayment.sessionId,
        paymentId: this.paymentId
      }).then(status => {
        if (status.status === 'SUCCESS') {
          SnackController.showSuccess('Deposit completed')
          ExchangeController.reset()

          if (namespace) {
            ChainController.fetchTokenBalance()
            ConnectionController.updateBalance(namespace)
          }
          RouterController.replace('Transactions')
        } else if (status.status === 'FAILED') {
          SnackController.showError('Deposit failed')
        }
      })
      SnackController.showLoading('Deposit in progress...')
      RouterController.replace(redirectView)
    }
  }

  private onAmountChange({ detail }: InputEvent) {
    ExchangeController.setAmount(detail ? Number(detail) : null)
  }

  private async getPaymentAssets() {
    if (this.network) {
      await ExchangeController.getAssetsForNetwork(this.network.caipNetworkId)
    }
  }

  private async setDefaultPaymentAsset() {
    if (this.network) {
      const paymentAssets = await ExchangeController.getAssetsForNetwork(this.network.caipNetworkId)

      if (paymentAssets[0]) {
        ExchangeController.setPaymentAsset(paymentAssets[0])
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-deposit-from-exchange-view': W3mDepositFromExchangeView
  }
}
