import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [global, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <button @click=${ClientCtrl.client().disconnect}>
        <w3m-text variant="medium-normal" color="inverse">Disconnect</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
