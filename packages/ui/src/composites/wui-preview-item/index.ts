import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-icon/index.js'
import '../wui-avatar/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-preview-item')
export class WuiPreviewItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public text = ''

  @property() public address = ''

  @property() public imageSrc?: string

  @property({ type: Boolean }) public isAddress = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-text variant="large-500" color="fg-100">${this.text}</wui-text>
      ${this.imageTemplate()}`
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.isAddress) {
      return html`<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`
    } else if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="networkPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-preview-item': WuiPreviewItem
  }
}
