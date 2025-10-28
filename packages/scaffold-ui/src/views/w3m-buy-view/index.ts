import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { NumberUtil, ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  OnRampController,
  OnRampUtil
} from '@reown/appkit-controllers'
import '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-onramp-input/index.js'
import styles from './styles.js'

@customElement('w3m-buy-view')
export class W3mBuyView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @state() private fiatCurrency = OnRampController.state.selectedFiatCurrency
  @state() private cryptoCurrency = OnRampController.state.selectedCryptoCurrency
  @state() private fiatAmount = OnRampController.state.fiatAmount
  @state() private quote = OnRampController.state.quote
  @state() private quoteLoading = OnRampController.state.quoteLoading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('quote', val => {
          this.quote = val
        }),
        OnRampController.subscribeKey('quoteLoading', val => {
          this.quoteLoading = val
        }),
        OnRampController.subscribeKey('selectedFiatCurrency', val => {
          this.fiatCurrency = val
        }),
        OnRampController.subscribeKey('selectedCryptoCurrency', val => {
          this.cryptoCurrency = val
        }),
        OnRampController.subscribeKey('fiatAmount', val => {
          this.fiatAmount = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    console.log('this.quote', this.quote)

    return html`
      <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const} gap="3">
        <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
          <wui-flex flexDirection="column" alignItems="center" gap="2">
            <w3m-onramp-input
              type="fiat"
              .value=${this.fiatAmount}
              .disabled=${!this.fiatCurrency}
              .onSetAmount=${this.handleChangeFiatAmount.bind(this)}
              target="sourceToken"
              .currency=${this.fiatCurrency}
              placeholderButtonLabel="Select currency"
            ></w3m-onramp-input>
            <w3m-onramp-input
              type="crypto"
              .value=${this.quote?.cryptoAmount.toString()}
              .disabled=${true}
              target="targetToken"
              .currency=${this.cryptoCurrency}
              placeholderButtonLabel="Select token"
              .readOnly=${true}
            ></w3m-onramp-input>
            ${this.quoteDetailsTemplate()} ${this.buyButtonTemplate()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private quoteDetailsTemplate() {
    if (!this.quote) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="1" class="quote-details-container">
        <wui-separator></wui-separator>
        <wui-flex flexDirection="column" gap="2" .padding=${['2', '0', '0', '0'] as const}>
          <wui-flex justifyContent="space-between" alignItems="center">
            <wui-text variant="sm-regular" color="secondary">Network</wui-text>
            <wui-text variant="sm-regular" color="primary">${this.quote.network}</wui-text>
          </wui-flex>
          <wui-flex justifyContent="space-between" alignItems="center">
            <wui-text variant="sm-regular" color="secondary">Payment Method</wui-text>
            <wui-text variant="sm-regular" color="primary">${this.quote.paymentMethod}</wui-text>
          </wui-flex>
          <wui-separator></wui-separator>
          ${this.feeBreakdownTemplate()}
          <wui-separator></wui-separator>
          <wui-flex justifyContent="space-between" alignItems="center">
            <wui-text variant="md-regular" color="primary">Total Fee</wui-text>
            <wui-text variant="md-regular" color="primary"
              >${this.quote.fiatCurrency} ${this.quote.totalFee}</wui-text
            >
          </wui-flex>
          <wui-separator></wui-separator>
          <wui-flex justifyContent="space-between" alignItems="center">
            <wui-text variant="md-regular" color="primary">Total Amount</wui-text>
            <wui-text variant="md-regular" color="primary"
              >${NumberUtil.bigNumber(this.quote.fiatAmount)
                .plus(this.quote.totalFee)
                .round(4)
                .toString()}</wui-text
            >
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private feeBreakdownTemplate() {
    if (!this.quote?.feeBreakdown || this.quote.feeBreakdown.length === 0) {
      return null
    }

    return html`
      ${this.quote.feeBreakdown.map(
        fee => html`
          <wui-flex justifyContent="space-between" alignItems="center">
            <wui-text variant="sm-regular" color="secondary">${fee.name}</wui-text>
            <wui-text variant="sm-regular" color="primary"
              >${this.quote?.fiatCurrency} ${fee.value}</wui-text
            >
          </wui-flex>
        `
      )}
    `
  }

  private handleChangeFiatAmount(value: string) {
    OnRampController.setFiatAmount(value)
    this.onDebouncedGetQuote(value)
  }

  private onDebouncedGetQuote = CoreHelperUtil.debounce((value: string) => {
    if (this.cryptoCurrency && value) {
      OnRampController.getQuote()
    }
  })

  private buyButtonTemplate() {
    return html`
      <wui-button
        variant="accent-primary"
        fullWidth
        size="lg"
        borderRadius="xs"
        ?disabled=${!this.quote}
        @click=${this.onBuyNow.bind(this)}
        ?loading=${this.quoteLoading}
      >
        Buy Now
      </wui-button>
    `
  }

  private onBuyNow() {
    if (!this.cryptoCurrency) {
      throw new Error('Crypto currency is not selected')
    }
    if (!this.quote) {
      throw new Error('Quote is not available')
    }
    if (!this.fiatCurrency) {
      throw new Error('Fiat currency is not selected')
    }

    if (!ChainController.state.activeCaipAddress) {
      throw new Error('Wallet address is not available')
    }

    const { address } = ParseUtil.parseCaipAddress(ChainController.state.activeCaipAddress)
    console.log('this.quote', this.fiatCurrency.symbol)
    const url = OnRampUtil.createTransakUrl({
      environment: 'staging',
      colorMode: 'DARK',
      paymentMethod: 'credit_debit_card',
      fiatCurrencyCode: this.fiatCurrency.symbol,
      fiatAmount: this.quote.fiatAmount.toString(),
      productsAvailed: 'BUY',
      widgetHeight: '800',
      widgetWidth: '500',
      walletAddress: address,
      exchangeScreenTitle: 'Buy Crypto',
      disableWalletAddressForm: 'false',
      cryptoCurrencyCode: this.cryptoCurrency.symbol,
      network: 'ethereum'
    })

    OnRampUtil.openTransak(url)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-buy-view': W3mBuyView
  }
}
