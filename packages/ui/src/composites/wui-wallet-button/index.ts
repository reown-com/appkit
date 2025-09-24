import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const TEXT_SIZE_BY_SIZE = {
  lg: 'lg-medium',
  md: 'md-medium',
  sm: 'sm-medium'
}

const ICON_SIZE_BY_SIZE = {
  lg: 'xl',
  md: 'lg',
  sm: 'md'
}

@customElement('wui-wallet-button')
export class WuiWalletButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name? = ''

  @property() public size: 'lg' | 'md' | 'sm' = 'md'

  @property({ type: Boolean }) public walletConnect = false

  @property() public icon?: IconType

  @property({ type: Boolean }) public loading = false

  @property({ type: Boolean }) public error = false

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['error'] = `${this.error}`

    return html`
      <button ?disabled=${this.disabled} data-size=${this.size} data-error=${this.error}>
        ${this.leftViewTemplate()} ${this.rightViewTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftViewTemplate() {
    if (this.error) {
      return html`<wui-icon name="warningCircle" iconColor="inherit" size="md"></wui-icon>`
    }

    if (this.loading) {
      return html`<wui-loading-spinner size="lg" color="inherit"></wui-loading-spinner>`
    }

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${ifDefined(this.name)}></wui-image>`
    }

    if (this.icon) {
      return html`<wui-icon
        size=${ICON_SIZE_BY_SIZE[this.size]}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`
    }

    return null
  }

  private rightViewTemplate() {
    return html`
      <wui-text variant=${TEXT_SIZE_BY_SIZE[this.size]} color="inherit"
        >${this.name || 'Unknown'}
      </wui-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-button': WuiWalletButton
  }
}
