import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

type Variant =
  | 'big-bold'
  | 'medium-regular'
  | 'small-regular'
  | 'small-thin'
  | 'xsmall-bold'
  | 'xsmall-regular'

type Color = 'accent' | 'error' | 'inverse' | 'primary' | 'secondary' | 'tertiary'

@customElement('w3m-text')
export class W3mText extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant?: Variant = 'medium-regular'

  @property() public color?: Color = 'primary'

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-big-bold': this.variant === 'big-bold',
      'w3m-medium-regular': this.variant === 'medium-regular',
      'w3m-small-regular': this.variant === 'small-regular',
      'w3m-small-thin': this.variant === 'small-thin',
      'w3m-xsmall-regular': this.variant === 'xsmall-regular',
      'w3m-xsmall-bold': this.variant === 'xsmall-bold',
      'w3m-color-primary': this.color === 'primary',
      'w3m-color-secondary': this.color === 'secondary',
      'w3m-color-tertiary': this.color === 'tertiary',
      'w3m-color-inverse': this.color === 'inverse',
      'w3m-color-accnt': this.color === 'accent',
      'w3m-color-error': this.color === 'error'
    }

    return html`
      <span data-testid="component-text">
        <slot class=${classMap(classes)}></slot>
      </span>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-text': W3mText
  }
}
