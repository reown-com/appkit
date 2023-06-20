import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-spinner')
export class W3mSpinner extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  @property() public color: 'accent' | 'fill' = 'accent'
  @property() public size: 'medium' | 'small' = 'medium'

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <svg class="${this.size}" viewBox="0 0 50 50">
        <circle
          class="${this.color}"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="4"
          stroke="#fff"
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-spinner': W3mSpinner
  }
}
