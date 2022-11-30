import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public chainId = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    const src = UiUtil.getChainIcon(this.chainId)

    return html`
      <button class="w3m-network-button" @click=${this.onClick}>
        ${src
          ? html`<w3m-network-image src=${src}></w3m-network-image>`
          : SvgUtil.NETWORK_PLACEHOLDER}
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
