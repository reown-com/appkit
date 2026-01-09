import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-network-button')
export class WuiNetworkButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property({ type: Boolean }) public isUnsupportedChain?: boolean = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public size: 'sm' | 'md' | 'lg' = 'lg'

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = {
      sm: 'sm-regular',
      md: 'md-regular',
      lg: 'lg-regular'
    } as const

    return html`
      <button data-size=${this.size} data-testid="wui-network-button" ?disabled=${this.disabled}>
        ${this.visualTemplate()}
        <wui-text variant=${textVariant[this.size]} color="primary">
          <slot></slot>
        </wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private visualTemplate() {
    if (this.isUnsupportedChain) {
      return html` <wui-icon-box color="error" icon="warningCircle"></wui-icon-box> `
    }
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html` <wui-icon size="xl" color="default" name="networkPlaceholder"></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-button': WuiNetworkButton
  }
}
