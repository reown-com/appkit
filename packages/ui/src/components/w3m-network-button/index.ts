import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import '../w3m-network-image'
import '../w3m-text'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public src = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <button class="w3m-network-button" @click=${this.onClick}>
        <div class="w3m-network-button-wrap">
          <w3m-network-image name=${this.name} .src=${this.src}></w3m-network-image>
          <w3m-text variant="xsmall-normal"> ${this.name} </w3m-text>
        </div>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
