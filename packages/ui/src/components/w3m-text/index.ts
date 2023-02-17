import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

type Variant =
  | 'large-bold'
  | 'medium-normal'
  | 'medium-thin'
  | 'small-normal'
  | 'small-thin'
  | 'xsmall-normal'
  | 'xxsmall-bold'

type Color = 'accent' | 'error' | 'inverse' | 'primary' | 'secondary' | 'tertiary'

@customElement('w3m-text')
export class W3mText extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant?: Variant = 'medium-normal'
  @property() public color?: Color = 'primary'

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-large-bold': this.variant === 'large-bold',
      'w3m-medium-normal': this.variant === 'medium-normal',
      'w3m-medium-thin': this.variant === 'medium-thin',
      'w3m-small-normal': this.variant === 'small-normal',
      'w3m-small-thin': this.variant === 'small-thin',
      'w3m-xsmall-normal': this.variant === 'xsmall-normal',
      'w3m-xxsmall-bold': this.variant === 'xxsmall-bold',
      'w3m-color-primary': this.color === 'primary',
      'w3m-color-secondary': this.color === 'secondary',
      'w3m-color-tertiary': this.color === 'tertiary',
      'w3m-color-inverse': this.color === 'inverse',
      'w3m-color-accnt': this.color === 'accent',
      'w3m-color-error': this.color === 'error'
    }

    return html`
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
