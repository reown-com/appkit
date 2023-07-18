import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null

  @property() public name = ''

  @property() public chainId = ''

  @property() public unsupported = false

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-unsupported': this.unsupported
    }

    return html`
      <button
        data-testid="component-network-button"
        @click=${this.onClick}
        class=${classMap(classes)}
      >
        <w3m-network-image chainId=${this.chainId}></w3m-network-image>
        <w3m-text variant="xsmall-regular">${this.name}</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
