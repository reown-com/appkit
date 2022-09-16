import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-modal-content')
export class W3mModalContent extends LitElement {
  public static styles = [global, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-modal-content">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-content': W3mModalContent
  }
}
