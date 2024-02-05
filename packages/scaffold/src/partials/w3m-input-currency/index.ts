import { html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { customElement } from '@web3modal/ui'
import styles from './styles.js'
import {
  ModalController,
  OnRampController,
  type PaymentCurrency,
  type PurchaseCurrency
} from '@web3modal/core'

type Currency = {
  name: string
  symbol: string
  icon?: string
}

const ICONS_BY_CURRENCY: Record<string, string> = {
  USD: 'https://upload.wikimedia.org/wikipedia/commons/8/88/United-states_flag_icon_round.svg',
  USDC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png',
  EUR: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg',
  GBP: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg'
}

@customElement('w3m-input-currency')
export class W3mInputCurrency extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- Properties & State ---------------------------------------- //
  @property({ type: String }) public type: 'Token' | 'Fiat' = 'Token'
  @state() public currencies: Currency[] | null = []
  @state() public selectedCurrency = this.currencies?.[0]

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
      })
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    OnRampController.getAvailableCurrencies()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-input-text type="number" size="lg">
      ${this.selectedCurrency
        ? html` <wui-flex
            class="currency-container"
            justifyContent="space-between"
            alignItems="center"
            gap="xxs"
            @click=${() => ModalController.open({ view: `OnRamp${this.type}Select` })}
          >
            <wui-image src=${this.selectedCurrency.icon || ''}></wui-image>
            <wui-text color="fg-100"> ${this.selectedCurrency.symbol} </wui-text>
          </wui-flex>`
        : html`<wui-loading-spinner></wui-loading-spinner>`}
    </wui-input-text>`
  }

  private formatPaymentCurrency(currency: PaymentCurrency) {
    return {
      name: currency.id,
      symbol: currency.id,
      icon: ICONS_BY_CURRENCY[currency.id]
    }
  }
  private formatPurchaseCurrency(currency: PurchaseCurrency) {
    return {
      name: currency.name,
      symbol: currency.symbol,
      icon: ICONS_BY_CURRENCY[currency.symbol]
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-currency': W3mInputCurrency
  }
}
