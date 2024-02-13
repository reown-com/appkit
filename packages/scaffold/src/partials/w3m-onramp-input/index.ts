import { html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { customElement } from '@web3modal/ui'
import styles from './styles.js'
import {
  AssetController,
  ModalController,
  OnRampController,
  type PaymentCurrency,
  type PurchaseCurrency
} from '@web3modal/core'

type Currency = {
  name: string
  symbol: string
}

@customElement('w3m-onramp-input')
export class W3mOnrampInput extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: String }) public type: 'Token' | 'Fiat' = 'Token'

  @property({ type: Number }) public value = 0

  @state() public currencies: Currency[] | null = []

  @state() public selectedCurrency = this.currencies?.[0]

  // -- Private ------------------------------------------- //
  @state() private currencyImages = AssetController.state.currencyImages

  @state() private tokenImages = AssetController.state.tokenImages

  public constructor() {
    super()
    this.unsubscribe.push(
      OnRampController.subscribeKey('purchaseCurrency', val => {
        if (!val || this.type === 'Fiat') {
          return
        }
        this.selectedCurrency = this.formatPurchaseCurrency(val)
      }),
      OnRampController.subscribeKey('paymentCurrency', val => {
        if (!val || this.type === 'Token') {
          return
        }
        this.selectedCurrency = this.formatPaymentCurrency(val)
      }),
      OnRampController.subscribe(val => {
        if (this.type === 'Fiat') {
          this.currencies = val.purchaseCurrencies.map(this.formatPurchaseCurrency)
        } else {
          this.currencies = val.paymentCurrencies.map(this.formatPaymentCurrency)
        }
      }),
      AssetController.subscribe(val => {
        this.currencyImages = { ...val.currencyImages }
        this.tokenImages = { ...val.tokenImages }
        this.selectedCurrency =
          this.type === 'Fiat'
            ? this.formatPurchaseCurrency(OnRampController.state.purchaseCurrency)
            : this.formatPaymentCurrency(OnRampController.state.paymentCurrency)
      })
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    OnRampController.getAvailableCurrencies()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-swap-input
        .currency=${this.selectedCurrency}
        .value=${this.value.toString()}
        .onSelect=${() => ModalController.open({ view: `OnRamp${this.type}Select` })}
        .type=${this.type}
      >
      </wui-swap-input>
    `
  }

  private formatPaymentCurrency(currency: PaymentCurrency) {
    return {
      name: currency.id,
      symbol: currency.id,
      image: this?.currencyImages?.[currency.id]
    }
  }

  private formatPurchaseCurrency(currency: PurchaseCurrency) {
    return {
      name: currency.name,
      symbol: currency.symbol,
      image: this?.tokenImages?.[currency.symbol]
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-input': W3mOnrampInput
  }
}
