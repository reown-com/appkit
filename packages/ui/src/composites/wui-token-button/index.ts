import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'
import type { FlexDirectionType } from '../../utils/TypeUtil.js'

interface TokenInfo {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoURI: string
  domainVersion?: string
  eip2612?: boolean
  isFoT?: boolean
  tags?: string[]
}

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public logoURI?: string

  @property() public text?: string

  @property() public flexDirection: FlexDirectionType = 'row'

  @property() public onClick: ((token: TokenInfo) => void) | null = null

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
    --local-flex-direction: ${this.flexDirection};
  `

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
        @click=${this.onClick?.bind(this)}
      >
        ${tokenElement}
        <wui-text variant="paragraph-600" color="fg-100">${this.text}</wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
