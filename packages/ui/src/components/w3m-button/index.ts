import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import '../w3m-text'
import styles, { dynamicStyles } from './styles'

type Variant = 'fill' | 'ghost'

@customElement('w3m-button')
export class W3mButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public variant?: Variant = 'fill'

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-button': true,
      'w3m-button-fill': this.variant === 'fill',
      'w3m-button-ghost': this.variant === 'ghost'
    }

    const textColor = this.variant === 'fill' ? 'inverse' : 'accent'

    return html`
      ${dynamicStyles()}
      <button class=${classMap(classes)}>
        <w3m-text variant="small-normal" color=${textColor}>
          <slot></slot>
        </w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-button': W3mButton
  }
}
