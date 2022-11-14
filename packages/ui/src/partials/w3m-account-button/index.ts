import { ClientCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
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
