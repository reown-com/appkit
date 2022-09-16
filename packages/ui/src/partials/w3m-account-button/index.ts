import { ClientCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
  public static styles = [global]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html` <button @click=${ClientCtrl.ethereum().disconnect}>Disconnect</button> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
