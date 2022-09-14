import { ClientCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import { dynamicStyles } from './styles'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
  public static styles = [global]

  // -- state & properties ------------------------------------------- //
  @property() public address = '0x1234567890'
  @property() public balance = '0.527'

  // -- lifecycle ---------------------------------------------------- //

  // -- private ------------------------------------------------------ //

  // -- render ------------------------------------------------------- //

  protected render() {
    return html`
      ${dynamicStyles()}
      <div class="w3m-act-button-container">
        <div class="w3m-balance-container">
          <p>${this.balance} ETH</p>
          <p>${this.balance} ETH</p>
        </div>
        <button @click=${ClientCtrl.ethereum().disconnect}>${this.address}</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
