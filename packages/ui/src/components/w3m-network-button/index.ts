import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { NETWORK_PLACEHOLDER } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { getChainIcon } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public chainId = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    const src = getChainIcon(this.chainId)

    return html`
      ${dynamicStyles()}

      <button class="w3m-network-button" @click=${this.onClick}>
        ${src ? html`<w3m-network-image src=${src}></w3m-network-image>` : NETWORK_PLACEHOLDER}
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
