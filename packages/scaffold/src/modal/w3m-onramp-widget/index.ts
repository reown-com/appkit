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
          <w3m-swap-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount || 0}
          ></w3m-swap-input>
          <w3m-swap-input
            type="Token"
            .value=${this.purchaseAmount || 0}
            .loading=${this.quoteLoading}
          ></w3m-swap-input>
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

  private async onPaymentAmountChange(event: CustomEvent<string>) {
    OnRampController.setPaymentAmount(Number(event.detail))
    await OnRampController.getQuote()
  }

  private async selectPresetAmount(amount: number) {
    OnRampController.setPaymentAmount(amount)
    await OnRampController.getQuote()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-widget': W3mOnrampWidget
  }
}
