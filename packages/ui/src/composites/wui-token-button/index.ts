import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'
import type { TokenInfo } from '@web3modal/core/dist/types/src/controllers/SwapApiController.js'

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public logoURI?: string

  @property() public symbol?: string

  @property() public onClick: (token: TokenInfo) => void = () => {}

  // -- Render -------------------------------------------- //
  public override render() {
    const tokenElement = this.logoURI
      ? html`<wui-image src=${this.logoURI}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <button
        size="sm"
        variant="shade"
        class="token-select-button"
        @click=${this.onClick.bind(this)}
      >
        ${tokenElement}
        <wui-text variant="paragraph-600" color="fg-100">${this.symbol}</wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
