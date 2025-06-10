import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-image')
export class WuiImage extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public src = './path/to/image.jpg'

  @property() public alt = 'Image'

  @property() public size?: SizeType = undefined

  @property() public objectFit: 'cover' | 'contain' = 'cover'

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.objectFit) {
      this.dataset['objectFit'] = this.objectFit
    }

    this.style.cssText = `
      --local-width: ${this.size ? `var(--wui-icon-size-${this.size});` : '100%'};
      --local-height: ${this.size ? `var(--wui-icon-size-${this.size});` : '100%'};
      `

    return html`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`
  }

  private handleImageError() {
    this.dispatchEvent(new CustomEvent('onLoadError', { bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-image': WuiImage
  }
}
