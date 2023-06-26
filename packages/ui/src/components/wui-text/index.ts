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

type Color = 'accent' | 'error' | 'inverse' | 'primary' | 'secondary' | 'tertiary' | 'success'

@customElement('wui-text')
export class WuiText extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant: Variant = 'md-medium'

  @property() public color: Color = 'primary'

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
      'wui-color-accent': this.color === 'accent',
      'wui-color-error': this.color === 'error',
      'wui-color-success': this.color === 'success',
      'wui-color-inverse': this.color === 'inverse',
      'wui-color-primary': this.color === 'primary',
      'wui-color-secondary': this.color === 'secondary',
      'wui-color-tertiary': this.color === 'tertiary'
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
