import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../wui-avatar'
import '../../layout/wui-flex'
import '../../components/wui-text'
import '../../components/wui-image'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import { UiHelperUtil } from '../../utils/UiHelperUtils'
import styles from './styles'

@customElement('wui-account-button')
export class WuiAccountButton extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public balance?: string

  @property() public address = ''

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button>
        ${this.balanceTemplate()}
        <wui-flex gap="xxs" alignItems="center">
          <wui-avatar address=${this.address}></wui-avatar>
          <wui-text variant="paragraph-600" color="inverse-100">
            ${UiHelperUtil.getTruncateAddress(this.address, 4)}
          </wui-text>
        </wui-flex>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private balanceTemplate() {
    if (this.balance && this.imageSrc) {
      return html`
        <wui-image src=${this.imageSrc}></wui-image>
        <wui-text variant="paragraph-600" color="fg-100"> ${this.balance} </wui-text>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-account-button': WuiAccountButton
  }
}
