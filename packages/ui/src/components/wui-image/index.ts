import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, LogoType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-image')
export class WuiImage extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public src?: string = './path/to/image.jpg'

  @property() public logo?: LogoType

  @property() public icon?: IconType

  @property() public alt = 'Image'

  @property() public size?: SizeType = undefined

  @property({ type: Boolean }) public boxed?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-width: ${this.size ? `var(--wui-icon-size-${this.size});` : '100%'};
      --local-height: ${this.size ? `var(--wui-icon-size-${this.size});` : '100%'};
      `

    if (this.boxed) {
      this.dataset['boxed'] = 'true'
    }

    if (this.icon) {
      return html`<wui-icon color="default" size="inherit" name=${this.icon}></wui-icon> `
    }

    if (this.logo) {
      return html`<wui-icon color="default" size="inherit" name=${this.logo}></wui-icon> `
    }

    return html`<img src=${ifDefined(this.src)} alt=${this.alt} @error=${this.handleImageError} />`
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
