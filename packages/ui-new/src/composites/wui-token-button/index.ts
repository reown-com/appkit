import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ontouchstart>
        ${this.tokenTemplate()}
        <wui-text variant="paragraph-600" color="fg-100">${this.text}</wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private tokenTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html`
      <wui-icon-box
        size="sm"
        iconColor="fg-200"
        backgroundColor="fg-300"
        icon="networkPlaceholder"
      ></wui-icon-box>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
