import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-icon-box/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-wallet-button')
export class WuiWalletButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name? = ''

  @property({ type: Boolean }) public walletConnect = false

  @property() public icon?: IconType

  @property() public iconSize?: SizeType

  @property({ type: Boolean }) public loading = false

  @property({ type: Boolean }) public error = false

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public shake = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['error'] = `${this.error}`

    return html`
      <button ?disabled=${this.disabled}>
        ${this.leftViewTemplate()} ${this.rightViewTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftViewTemplate() {
    if (this.error) {
      return html`<wui-icon-box
        icon="warningCircle"
        iconColor="error-100"
        backgroundColor="error-100"
        size="sm"
        iconSize="xs"
      ></wui-icon-box>`
    }

    if (this.loading) {
      return html`<wui-loading-spinner size="md" color="fg-100"></wui-loading-spinner>`
    }

    if (this.icon) {
      return html`<wui-icon
        size=${this.iconSize ?? 'xl'}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`
    }

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon size="xl" color="fg-100" name="walletPlaceholder"></wui-icon>`
  }

  private rightViewTemplate() {
    return html`
      <wui-text variant="paragraph-500" color="fg-100">${this.name || 'Unknown'} </wui-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-button': WuiWalletButton
  }
}
