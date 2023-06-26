import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { globalStyles } from '../../utils/ThemeUtil'
import styles from './styles'

type Variant =
  | 'lg-medium'
  | 'lg-semibold'
  | 'md-bold'
  | 'md-medium'
  | 'md-numerals'
  | 'md-semibold'
  | 'sm-medium'
  | 'sm-semibold'
  | 'xxs-bold'

type Color =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-300'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant: Variant = 'md-medium'

  @property() public color: Color = 'fg-300'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      'wui-lg-semibold': this.variant === 'lg-semibold',
      'wui-lg-medium': this.variant === 'lg-medium',
      'wui-md-bold': this.variant === 'md-bold',
      'wui-md-semibold': this.variant === 'md-semibold',
      'wui-md-medium': this.variant === 'md-medium',
      'wui-md-numerals': this.variant === 'md-numerals',
      'wui-sm-semibold': this.variant === 'sm-semibold',
      'wui-sm-medium': this.variant === 'sm-medium',
      'wui-xxs-bold': this.variant === 'xxs-bold',
      'wui-color-blue-100': this.color === 'blue-100',
      'wui-color-error-100': this.color === 'error-100',
      'wui-color-success-100': this.color === 'success-100',
      'wui-color-inverse-100': this.color === 'inverse-100',
      'wui-color-inverse-000': this.color === 'inverse-000',
      'wui-color-fg-300': this.color === 'fg-300',
      'wui-color-fg-200': this.color === 'fg-200',
      'wui-color-fg-100': this.color === 'fg-100'
    }

    return html`
      <span>
        <slot class=${classMap(classes)}></slot>
      </span>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-text': WuiText
  }
}
