import { AccountController, ModalController, OnRampController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'

const PAYMENT_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£'
}

const BUY_PRESET_AMOUNTS = [100, 250, 500, 1000]

const MIN_AMOUNT = 30

const MAX_AMOUNT = 10000

@customElement('w3m-onramp-widget')
export class W3mOnrampWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  @state() private paymentCurrency = OnRampController.state.paymentCurrency

  @state() private paymentAmount = OnRampController.state.paymentAmount

  @state() private purchaseAmount = OnRampController.state.purchaseAmount

  @state() private quoteLoading = OnRampController.state.quotesLoading

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
        }),
        OnRampController.subscribe(val => {
          this.paymentCurrency = val.paymentCurrency
          this.paymentAmount = val.paymentAmount
          this.purchaseAmount = val.purchaseAmount
          this.quoteLoading = val.quotesLoading
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <w3m-onramp-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount}
          ></w3m-onramp-input>
          <w3m-onramp-input
            type="Token"
            .value=${this.purchaseAmount}
            .loading=${this.quoteLoading}
          ></w3m-onramp-input>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="xs">
            ${BUY_PRESET_AMOUNTS.map(
              amount =>
                html`<wui-button
                  variant=${this.paymentAmount === amount ? 'accentBg' : 'shade'}
                  size="xs"
                  textVariant="paragraph-600"
                  fullWidth
                  @click=${() => this.selectPresetAmount(amount)}
                  >${`${
                    PAYMENT_CURRENCY_SYMBOLS[this.paymentCurrency?.id || 'USD']
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
    const error = this.validateAmount(this.paymentAmount || 0, this.paymentCurrency?.id || '')
    if (!this.connected) {
      return html`<wui-button
        @click=${this.openModal.bind(this)}
        variant="accentBg"
        fullWidth
        size="lg"
        borderRadius="xs"
      >
        Connect wallet
      </wui-button>`
    }

    if (error) {
      return html`<wui-button
        @click=${this.getQuotes.bind(this)}
        variant="accent"
        fullWidth
        size="lg"
        borderRadius="xs"
        ?disabled=${true}
      >
        ${error}
      </wui-button>`
    }

    return html`<wui-button
      @click=${this.getQuotes.bind(this)}
      fullWidth
      size="lg"
      borderRadius="xs"
    >
      Get quotes
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

  private async onPaymentAmountChange(event: CustomEvent<string>) {
    OnRampController.setPaymentAmount(Number(event.detail))
    await OnRampController.getQuote()
  }

  private async selectPresetAmount(amount: number) {
    OnRampController.setPaymentAmount(amount)
    await OnRampController.getQuote()
  }

  private validateAmount(amount: number, symbol: string): string | null {
    if (!amount || amount === 0) {
      return 'Enter an amount'
    }

    if (amount < MIN_AMOUNT) {
      return `Buy ${symbol}${MIN_AMOUNT} minimum`
    }

    if (amount > MAX_AMOUNT) {
      return `Buy ${symbol}${MAX_AMOUNT} maximum`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-widget': W3mOnrampWidget
  }
}
