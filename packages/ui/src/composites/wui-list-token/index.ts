import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { NumberUtil } from '@reown/appkit-common'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
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

  @property({ type: Number }) public tokenValue = 0.0

  @property() public tokenAmount = '0.0'

  @property() public tokenCurrency = ''

  @property({ type: Boolean }) public clickable = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-clickable=${String(this.clickable)}>
        <wui-flex gap="2" alignItems="center">
          ${this.visualTemplate()}
          <wui-flex flexDirection="column" justifyContent="space-between" gap="1">
            <wui-text variant="md-regular" color="primary">${this.tokenName}</wui-text>
            <wui-text variant="sm-regular-mono" color="secondary">
              ${NumberUtil.formatNumberToLocalString(this.tokenAmount, 4)} ${this.tokenCurrency}
            </wui-text>
          </wui-flex>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          justifyContent="space-between"
          gap="1"
          alignItems="flex-end"
        >
          <wui-text variant="md-regular-mono" color="primary"
            >$${this.tokenValue.toFixed(2)}</wui-text
          >
          <wui-text variant="sm-regular-mono" color="secondary">
            ${NumberUtil.formatNumberToLocalString(this.tokenAmount, 4)}
          </wui-text>
        </wui-flex>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.tokenName && this.tokenImageUrl) {
      return html`<wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>`
    }

    return html`<wui-icon name="coinPlaceholder" color="default"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-token': WuiListToken
  }
}
