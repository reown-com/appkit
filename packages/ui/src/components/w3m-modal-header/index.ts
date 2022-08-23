import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import '../w3m-spinner'
import '../w3m-text'
import styles from './styles'

@customElement('w3m-modal-header')
export class W3mModalHeader extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public title = 'No Title'

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-modal-header">
        <w3m-text variant="large-bold">${this.title}</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-header': W3mModalHeader
  }
}
