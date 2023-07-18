import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

type Variant = 'primary' | 'secondary'

@customElement('w3m-button-big')
export class W3mButtonBig extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public disabled? = false

  @property() public variant?: Variant = 'primary'

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-secondary': this.variant === 'secondary'
    }

    return html`
      <button
        ?disabled=${this.disabled}
        data-testid="component-big-button"
        class=${classMap(classes)}
      >
        <slot></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-button-big': W3mButtonBig
  }
}
