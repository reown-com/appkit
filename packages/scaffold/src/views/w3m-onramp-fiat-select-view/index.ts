import { OnRampController, ModalController, AssetController } from '@web3modal/core'
import type { PaymentCurrency } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-onramp-fiat-select-view')
export class W3mOnrampFiatSelectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.paymentCurrency
  @state() public currencies = OnRampController.state.paymentCurrencies
  @state() private currencyImages = AssetController.state.currencyImages

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribe(val => {
          this.selectedCurrency = val.paymentCurrency
          this.currencies = val.paymentCurrencies
        }),
        AssetController.subscribeKey('currencyImages', val => (this.currencyImages = val))
      ]
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
        <wui-list-item
          imageSrc=${ifDefined(this.currencyImages?.[currency.id])}
          @click=${() => this.selectCurrency(currency)}
          variant="image"
        >
          <wui-text variant="paragraph-500" color="fg-100">${currency.id}</wui-text>
        </wui-list-item>
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
