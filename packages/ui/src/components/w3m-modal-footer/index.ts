import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { global, color } from '../../utils/Theme'
import styles from './styles.css'

@customElement('w3m-modal-footer')
export class W3mModalFooter extends LitElement {
  public static styles = [global, styles]

  protected dynamicStyles() {
    const { background } = color()

    return html`<style>
      .w3m-modal-footer {
        border-top: 1px solid ${background[2]};
      }
    </style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <div class="w3m-modal-footer">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-footer': W3mModalFooter
  }
}
