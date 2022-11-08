import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { global } from '../../utils/Theme'
import '../w3m-spinner'
import styles from './styles.css'

type Variant =
  | 'large-bold'
  | 'medium-bold'
  | 'medium-normal'
  | 'medium-thin'
  | 'small-normal'
  | 'small-thin'
  | 'xsmall-normal'
  | 'xxsmall-bold'

type Align = 'center' | 'left' | 'right'

type Color = 'accent' | 'error' | 'inverse' | 'primary' | 'secondary' | 'tertiary'

@customElement('w3m-text')
export class W3mText extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant?: Variant = 'medium-normal'
  @property() public align?: Align = 'left'
  @property() public color?: Color = 'primary'

  protected dynamicStyles() {
    return html`<style></style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-font': true,
      'w3m-font-large-bold': this.variant === 'large-bold',
      'w3m-font-medium-bold': this.variant === 'medium-bold',
      'w3m-font-medium-normal': this.variant === 'medium-normal',
      'w3m-font-medium-thin': this.variant === 'medium-thin',
      'w3m-font-small-normal': this.variant === 'small-normal',
      'w3m-font-small-thin': this.variant === 'small-thin',
      'w3m-font-xsmall-normal': this.variant === 'xsmall-normal',
      'w3m-font-xxsmall-bold': this.variant === 'xxsmall-bold',
      'w3m-font-left': this.align === 'left',
      'w3m-font-center': this.align === 'center',
      'w3m-font-right': this.align === 'right',
      'w3m-color-primary': this.color === 'primary',
      'w3m-color-secondary': this.color === 'secondary',
      'w3m-color-tertiary': this.color === 'tertiary',
      'w3m-color-inverse': this.color === 'inverse',
      'w3m-color-accnt': this.color === 'accent',
      'w3m-color-error': this.color === 'error'
    }

    return html`
      ${this.dynamicStyles()}

      <span class=${classMap(classes)}>
        <slot></slot>
      </span>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-text': W3mText
  }
}
