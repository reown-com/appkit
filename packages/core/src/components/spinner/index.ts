export default null
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

/**
 * Component
 */
@customElement('spinner')
export class SpinnerW3M extends LitElement {
  public static styles = styles

  @property()
  public size?: number = 25

  protected render() {
    return html`
      <svg viewBox="0 0 50 50" width="${this.size}" height="${this.size}">
        <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="#ffffff" />
      </svg>
    `
  }
}

/**
 * Types
 */
declare global {
  interface HTMLElementTagNameMap {
    spinner: SpinnerW3M
  }
}
