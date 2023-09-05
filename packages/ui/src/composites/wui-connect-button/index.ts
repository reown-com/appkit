import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-connect-button')
export class WuiConnectButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public loading = false

  @property() public text = 'Connect Wallet'

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.size === 'md' ? 'paragraph-600' : 'small-600'

    return html`
      <button
        data-size=${this.size}
        ?disabled=${this.disabled}
        class=${this.loading ? 'loading' : ''}
        ontouchstart
      >
        ${this.loadingTemplate()}
        <wui-text variant=${textVariant} color="inherit">
          ${this.loading ? 'Connecting...' : this.text}
        </wui-text>
      </button>
    `
  }

  public loadingTemplate() {
    if (this.loading) {
      return html`<svg viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>`
    }

    return html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-connect-button': WuiConnectButton
  }
}
