import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-connect-button')
export class WuiConnectButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<
    SizeType,
    'inherit' | 'xxl' | 'mdl' | 'xl' | 'xs' | 'm' | 'xxs'
  > = 'md'

  @property() public variant: 'primary' | 'secondary' = 'primary'

  @property({ type: Boolean }) public loading = false

  @property() public text = 'Connect Wallet'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //

  private contentTemplate() {
    const textVariants = {
      lg: 'lg-regular',
      md: 'md-regular',
      sm: 'sm-regular'
    } as const

    const colors = {
      primary: 'invert',
      secondary: 'accent-primary'
    } as const

    if (!this.loading) {
      return html` <wui-text variant=${textVariants[this.size]} color=${colors[this.variant]}>
        ${this.text}
      </wui-text>`
    }

    return html`<wui-loading-spinner
      color=${colors[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-connect-button': WuiConnectButton
  }
}
