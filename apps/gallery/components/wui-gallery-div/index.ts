import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles, colorStyles } from '@web3modal/ui/src/utils/ThemeUtil'
import styles from './styles'
import type { Color, Size } from '@web3modal/ui/src/utils/TypesUtil'

@customElement('wui-gallery-div')
export class WuiGalleryDiv extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Size = 'md'

  @property() public background: Color = 'fg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      [`wui-size-${this.size}`]: true,
      [`wui-bg-color-${this.background}`]: true
    }

    return html`<div class="${classMap(classes)}"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-gallery-div': WuiGalleryDiv
  }
}
