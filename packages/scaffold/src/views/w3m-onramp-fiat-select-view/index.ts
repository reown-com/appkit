import { OnRampController, ModalController } from '@web3modal/core'
import type { PaymentCurrency } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-onramp-fiat-select-view')
export class W3mOnrampFiatSelectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.paymentCurrency
  @state() public currencies = OnRampController.state.paymentCurrencies

  public constructor() {
    super()
    this.unsubscribe.push(
      OnRampController.subscribe(val => {
        this.selectedCurrency = val.paymentCurrency
        this.currencies = val.paymentCurrencies
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.currenciesTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private currenciesTemplate() {
    return this.currencies.map(
      currency => html`
        <wui-list-wallet
          imageSrc=${''}
          .installed=${true}
          name=${currency.id ?? 'Unknown'}
          @click=${() => this.selectCurrency(currency)}
        >
        </wui-list-wallet>
      `
    )
  }

  private selectCurrency(currency: PaymentCurrency) {
    if (!currency) {
      return
    }

    OnRampController.setPaymentCurrency(currency)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-fiat-select-view': W3mOnrampFiatSelectView
  }
}
