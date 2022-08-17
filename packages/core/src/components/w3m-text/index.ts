import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import fonts from '../../theme/fonts'
import global from '../../theme/global'
import '../w3m-spinner'
import styles from './styles'

type Variant =
  | 'large-bold'
  | 'medium-bold'
  | 'medium-normal'
  | 'medium-thin'
  | 'small-bold'
  | 'small-thin'
  | 'xsmall-normal'
  | 'xxsmall-bold'

@customElement('w3m-text')
export class W3mText extends LitElement {
  public static styles = [global, fonts(), styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant: Variant = 'medium-normal'
  @state() private readonly classes = {
    'w3m-font': true,
    'w3m-font-large-bold': this.variant === 'large-bold',
    'w3m-font-medium-bold': this.variant === 'medium-bold',
    'w3m-font-medium-normal': this.variant === 'medium-normal',
    'w3m-font-medium-thin': this.variant === 'medium-thin',
    'w3m-font-small-bold': this.variant === 'small-bold',
    'w3m-font-small-thin': this.variant === 'small-thin',
    'w3m-font-xsmall-normal': this.variant === 'xsmall-normal',
    'w3m-font-xxsmall-bold': this.variant === 'xxsmall-bold'
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <span class=${classMap(this.classes)}>
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
