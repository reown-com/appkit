import { AccountController, ModalController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'

type CoinbaseNetwork = {
  name: string
  display_name: string
  chain_id: string
  contract_address: string
}

type PaymentLimits = {
  id: string
  min: string
  max: string
}

type PaymentCurrency = {
  id: string
  payment_method_limits: PaymentLimits[]
}

type PurchaseCurrency = {
  id: string
  name: string
  symbol: string
  networks: CoinbaseNetwork[]
}

const ICONS_BY_CURRENCY: Record<string, string> = {
  USD: 'https://upload.wikimedia.org/wikipedia/commons/8/88/United-states_flag_icon_round.svg',
  USDC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png',
  EUR: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg',
  GBP: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg'
}

const PAYMENT_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£'
}

const BUY_PRESET_AMOUNTS = [100, 250, 500, 1000]

@customElement('w3m-onramp-widget')
export class W3mOnrampWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  @state() private paymentCurrencies: PaymentCurrency[] = []

  @state() private purchaseCurrencies: PurchaseCurrency[] = []

  @state() private selectedPaymentCurrency = this.paymentCurrencies[0]

  @state() private selectedPurchaseCurrency = this.purchaseCurrencies[0]

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('isConnected', val => {
          this.connected = val
        }),
        ModalController.subscribeKey('loading', val => {
          this.loading = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe()
    }
  }

  public override firstUpdated() {
    this.fetchOptions()
  }

  private fetchOptions() {
    this.purchaseCurrencies = [
      {
        id: '2b92315d-eab7-5bef-84fa-089a131333f5',
        name: 'USD Coin',
        symbol: 'USDC',
        networks: [
          {
            name: 'ethereum-mainnet',
            display_name: 'Ethereum',
            chain_id: '1',
            contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          },
          {
            name: 'polygon-mainnet',
            display_name: 'Polygon',
            chain_id: '137',
            contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
          }
        ]
      }
    ]

    this.paymentCurrencies = [
      {
        id: 'USD',
        payment_method_limits: [
          {
            id: 'card',
            min: '10.00',
            max: '7500.00'
          },
          {
            id: 'ach_bank_account',
            min: '10.00',
            max: '25000.00'
          }
        ]
      }
    ]

    this.selectedPaymentCurrency = this.paymentCurrencies[0]
    this.selectedPurchaseCurrency = this.purchaseCurrencies[0]
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.selectedPaymentCurrency || !this.selectedPurchaseCurrency) {
      return null
    }

    const purchaseCurrencies = this.purchaseCurrencies.map(this.formatPurchaseCurrency)
    const paymentCurrencies = this.paymentCurrencies.map(this.formatPaymentCurrency)
    const selectedPaymentCurrency = this.formatPaymentCurrency(this.selectedPaymentCurrency)
    const selectedPurchaseCurrency = this.formatPurchaseCurrency(this.selectedPurchaseCurrency)

    return html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-input-currency
            .currencies=${paymentCurrencies}
            .selectedCurrency=${selectedPaymentCurrency}
          ></wui-input-currency>
          <wui-input-currency
            .currencies=${purchaseCurrencies}
            .selectedCurrency=${selectedPurchaseCurrency}
          ></wui-input-currency>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="xs">
            ${BUY_PRESET_AMOUNTS.map(
              amount =>
                html`<wui-button variant="shade" size="xs" textVariant="paragraph-600" fullWidth
                  >${`${
                    PAYMENT_CURRENCY_SYMBOLS[this.selectedPaymentCurrency.id] || ''
                  } ${amount}`}</wui-button
                >`
            )}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `
  }

  private templateButton() {
    return this.connected
      ? html`<wui-button
          @click=${this.getQuotes.bind(this)}
          variant="fill"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Get quotes
        </wui-button>`
      : html`<wui-button
          @click=${this.openModal.bind(this)}
          variant="accentBg"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Connect wallet
        </wui-button>`
  }

  // -- Private ------------------------------------------- //
  private getQuotes() {
    if (!this.loading) {
      ModalController.open({ view: 'OnRampProviders' })
    }
  }

  private openModal() {
    ModalController.open({ view: 'Connect' })
  }

  private formatPaymentCurrency(currency: PaymentCurrency) {
    return {
      name: currency.id,
      symbol: currency.id,
      icon: ICONS_BY_CURRENCY[currency.id] as string
    }
  }
  private formatPurchaseCurrency(currency: PurchaseCurrency) {
    return {
      name: currency.name,
      symbol: currency.symbol,
      icon: ICONS_BY_CURRENCY[currency.symbol] as string
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-widget': W3mOnrampWidget
  }
}
