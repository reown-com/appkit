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

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.size === 'md' ? 'paragraph-600' : 'small-600'

    return html`
      <button data-size=${this.size} ?disabled=${this.loading} ontouchstart>
        ${this.loadingTemplate()}
        <wui-text variant=${textVariant} color=${this.loading ? 'accent-100' : 'inherit'}>
          <slot></slot>
        </wui-text>
      </button>
    `
  }

  public loadingTemplate() {
    if (!this.loading) {
      return null
    }

    return html`<wui-loading-spinner size=${this.size} color="accent-100"></wui-loading-spinner>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-connect-button': WuiConnectButton
  }
}
