import { OnRampController, ModalController, AssetController } from '@web3modal/core'
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
  @state() public tokens = OnRampController.state.purchaseCurrencies
  @state() private tokenImages = AssetController.state.tokenImages

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribe(val => {
          this.selectedCurrency = val.purchaseCurrencies
          this.tokens = val.purchaseCurrencies
        }),
        AssetController.subscribeKey('tokenImages', val => (this.tokenImages = val))
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
    return this.tokens.map(
      token => html`
        <wui-list-wallet
          imageSrc=${this.tokenImages?.[token.symbol] || ''}
          .installed=${true}
          name=${token.name ?? 'Unknown'}
          @click=${() => this.selectToken(token)}
        >
        </wui-list-wallet>
      `
    )
  }

  private selectToken(currency: PurchaseCurrency) {
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
