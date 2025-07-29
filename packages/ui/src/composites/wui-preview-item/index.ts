import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import styles from './styles.js'

@customElement('wui-preview-item')
export class WuiPreviewItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: String }) public text = ''

  @property({ type: String }) public address?: string

  @property({ type: String }) public imageSrc?: string

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      ${this.imageTemplate()}`
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.address) {
      return html`<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`
    } else if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html`<wui-icon size="lg" color="inverse" name="networkPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-preview-item': WuiPreviewItem
  }
}
