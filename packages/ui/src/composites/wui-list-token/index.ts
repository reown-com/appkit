import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-token')
export class WuiListToken extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public tokenName = ''

  @property() public tokenImageUrl = ''

  @property({ type: Number }) public tokenValue = 0.0

  @property() public tokenAmount = '0.0'

  @property() public tokenCurrency = ''

  @property({ type: Boolean }) public clickable = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-clickable=${String(this.clickable)}>
        <wui-flex gap="s" alignItems="center">
          ${this.visualTemplate()}
          <wui-flex flexDirection="column" justifyContent="spaceBetween">
            <wui-text variant="paragraph-500" color="fg-100">${this.tokenName}</wui-text>
            <wui-text variant="small-400" color="fg-200">
              ${UiHelperUtil.formatNumberToLocalString(this.tokenAmount, 4)} ${this.tokenCurrency}
            </wui-text>
          </wui-flex>
        </wui-flex>
        <wui-text variant="paragraph-500" color="fg-100">$${this.tokenValue.toFixed(2)}</wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.tokenName && this.tokenImageUrl) {
      return html`<wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>`
    }

    return html`<wui-icon name="coinPlaceholder" color="fg-100"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-token': WuiListToken
  }
}
