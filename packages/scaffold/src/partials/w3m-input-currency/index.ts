import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '@web3modal/ui'
import styles from './styles.js'
import { ModalController } from '@web3modal/core'

type Currency = {
  name: string
  symbol: string
  icon?: string
}

@customElement('w3m-input-currency')
export class W3mInputCurrency extends LitElement {
  public static override styles = styles

  // -- Properties & State ---------------------------------------- //
  @property({ type: Array }) public currencies: Currency[] = []
  @property({ type: Object }) public selectedCurrency = this.currencies[0]
  @property({ type: String }) public type: 'Token' | 'Fiat' = 'Token'

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.selectedCurrency) {
      return null
    }

    return html`
      <wui-input-text type="number">
        <wui-flex
          class="currency-container"
          justifyContent="space-between"
          alignItems="center"
          gap="xxs"
          @click=${() => ModalController.open({ view: `OnRamp${this.type}Select` })}
        >
          <wui-image src=${this.selectedCurrency.icon || ''}></wui-image>
          <wui-text color="fg-100"> ${this.selectedCurrency.symbol} </wui-text>
        </wui-flex>
      </wui-input-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-currency': W3mInputCurrency
  }
}
