import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-button-big')
export class W3mButtonBig extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public disabled? = false

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button ?disabled=${this.disabled}>
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
