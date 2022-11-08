import { ClientCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { scss } from '../../style/utils'
import { global, color } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
  public static styles = [global, scss`${styles}`]

  protected dynamicStyles() {
    const { foreground, background, overlay } = color()

    return html` <style>
      button {
        color: ${foreground.inverse};
        background-color: ${foreground.accent};
      }

      button::after {
        border: 1px solid ${overlay.thin};
      }

      button:hover::after {
        background-color: ${overlay.thin};
      }

      button:disabled {
        background-color: ${background[3]};
        color: ${foreground[3]};
      }
    </style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <button @click=${ClientCtrl.ethereum().disconnect}>
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
