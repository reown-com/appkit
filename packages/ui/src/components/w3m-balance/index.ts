import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import { roundBalance } from '../../utils/UiHelpers'
import '../w3m-text'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-balance')
export class W3mBalance extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public icon? = ''
  @property() public balance = ''
  @property() public variant = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div class="w3m-token-bal-container">
        <div class="w3m-eth-logo-container">${this.icon}</div>
        <w3m-text variant=${this.variant} color="primary"
          >${roundBalance(this.balance)} ETH</w3m-text
        >
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-balance': W3mBalance
  }
}
