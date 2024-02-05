import { OnRampController, ModalController } from '@web3modal/core'
import type { PurchaseCurrency } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-onramp-token-select-view')
export class W3mOnrampTokensView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public selectedCurrency = OnRampController.state.purchaseCurrencies
  @state() public currencies = OnRampController.state.purchaseCurrencies

  public constructor() {
    super()
    this.unsubscribe.push(
      OnRampController.subscribe(val => {
        this.selectedCurrency = val.purchaseCurrencies
        this.currencies = val.purchaseCurrencies
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
          name=${currency.name ?? 'Unknown'}
          @click=${() => this.selectCurrency(currency)}
        >
        </wui-list-wallet>
      `
    )
  }

  private selectCurrency(currency: PurchaseCurrency) {
    if (!currency) {
      return
    }

    OnRampController.setPurchaseCurrency(currency)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-token-select-view': W3mOnrampTokensView
  }
}
