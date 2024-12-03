import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../components/wui-loading-spinner/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import type { ButtonSize } from '../../utils/TypeUtil.js'

@customElement('wui-wallet-button')
export class WuiWalletButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name? = ''

  @property() public size: ButtonSize = 'md'

  @property({ type: Boolean }) public connecting = false

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['size'] = this.size

    return html`
      <button ?disabled=${this.disabled || this.connecting} ontouchstart>
        ${this.leftViewTemplate()} ${this.rightViewTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftViewTemplate() {
    if (this.imageSrc && this.name) {
      if (this.connecting) {
        return html`<wui-loading-spinner size="sm" color="inverse-100"></wui-loading-spinner>`
      }

      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return null
  }

  private rightViewTemplate() {
    if (this.name) {
      return html`<wui-text variant="paragraph-600" color="inverse-100">${this.name}</wui-text>`
    }

    return html`<wui-loading-spinner size="sm" color="inverse-100"></wui-loading-spinner>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-button': WuiWalletButton
  }
}
