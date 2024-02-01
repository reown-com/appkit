import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

type Currency = {
  name: string
  symbol: string
  icon: string
}

@customElement('wui-input-currency')
export class WuiInputCurrency extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Properties & State ---------------------------------------- //
  @property({ type: Array }) public currencies: Currency[] = []
  @property({ type: Object }) public selectedCurrency = this.currencies[0]

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.selectedCurrency) {
      return null
    }

    console.log('selected crrency', this.selectedCurrency)

    return html`
      <wui-input-text type="number">
        <wui-flex
          class="currency-container"
          justifyContent="space-between"
          alignItems="center"
          gap="xxs"
          @click=${this.onCurrencyClick.bind(this)}
        >
          <wui-image src=${this.selectedCurrency.icon}></wui-image>
          <wui-text color="fg-100"> ${this.selectedCurrency.symbol} </wui-text>
        </wui-flex>
      </wui-input-text>
    `
  }

  private onCurrencyClick() {
    console.log('open selector')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-currency': WuiInputCurrency
  }
}
