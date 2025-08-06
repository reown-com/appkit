import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, LogoType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-image')
export class WuiImage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public src?: string = './path/to/image.jpg'

  @property() public logo?: LogoType

  @property() public icon?: IconType

  @property() public alt = 'Image'

  @property() public size?: SizeType = undefined

  @property({ type: Boolean }) public boxed?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    const getSize = {
      inherit: 'inherit',
      xxs: '2',
      xs: '3',
      sm: '4',
      md: '4',
      mdl: '5',
      lg: '5',
      xl: '6',
      xxl: '7'
    } as const

    this.style.cssText = `
      --local-width: ${this.size ? `var(--apkt-spacing-${getSize[this.size]});` : '100%'};
      --local-height: ${this.size ? `var(--apkt-spacing-${getSize[this.size]});` : '100%'};
      `

    if (this.boxed) {
      this.dataset['boxed'] = 'true'
    }

    if (this.logo) {
      return html`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `
    }

    if (this.icon) {
      return html`<wui-icon color="inherit" size="inherit" name=${this.icon}></wui-icon> `
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
