import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { global, color } from '../../utils/Theme'
import '../w3m-network-image'
import '../w3m-text'
import styles from './styles.scss'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public src = ''

  protected dynamicStyles() {
    const { background, overlay } = color()

    return html`
      <style>
        .w3m-network-button:hover {
          background-color: ${background.accent};
          box-shadow: inset 0 0 0 1px ${overlay.thin};
        }
      </style>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <button class="w3m-network-button" @click=${this.onClick}>
        <w3m-network-image name=${this.name} .src=${this.src}></w3m-network-image>
        <w3m-text variant="xsmall-normal"> ${this.name} </w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
