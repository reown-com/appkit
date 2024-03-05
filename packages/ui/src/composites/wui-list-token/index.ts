import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-token')
export class WuiListToken extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public tokenName = ''

  @property() public tokenImageUrl = ''

  @property() public tokenValue = ''

  @property({ type: Number }) public tokenAmount = 0.0

  @property() public tokenCurrency = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ontouchstart>
        <wui-flex gap="s" alignItems="center">
          <wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>
          <wui-flex flexDirection="column" justifyContent="spaceBetween">
            <wui-text variant="paragraph-500" color="fg-100">${this.tokenName}</wui-text>
            <wui-text variant="small-400" color="fg-200"
              >${this.tokenAmount} ${this.tokenCurrency}</wui-text
            ></wui-flex
          >
        </wui-flex>
        <wui-text variant="paragraph-500" color="fg-100">${this.tokenValue}</wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-token': WuiListToken
  }
}
