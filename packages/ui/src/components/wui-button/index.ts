import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../wui-text'
import styles from './styles'
import type { Color } from '../../utils/TypesUtil'
import type { Size } from '../../utils/TypesUtil'

@customElement('wui-button')
export class WuiButton extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: Exclude<Size, 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public variant: 'accent' | 'fill' | 'shade' = 'fill'

  // -- render ------------------------------------------------------- //
  public render() {
    let textColor: Color = 'inverse-100'
    switch (this.variant) {
      case 'accent':
        textColor = 'blue-100'
        break
      case 'shade':
        textColor = 'fg-200'
        break
      case 'fill':
        textColor = 'inverse-100'
        break
      default:
        textColor = 'inverse-100'
    }

    const textVariant = this.size === 'md' ? 'md-semibold' : 'sm-semibold'

    textColor = this.disabled ? 'inherit' : textColor

    const classes = {
      [`wui-size-${this.size}`]: true,
      'wui-variant-fill': this.variant === 'fill',
      'wui-variant-transparent': this.variant === 'shade' || this.variant === 'accent'
    }

    return html`
      <button class="${classMap(classes)}" ?disabled=${this.disabled}>
        <wui-text variant=${textVariant} color=${textColor}>
          <slot></slot>
        </wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-button': WuiButton
  }
}
