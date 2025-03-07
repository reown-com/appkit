import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonVariant } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-button/index.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

@customElement('wui-inactive-profile-wallet-item')
export class WuiInactiveProfileWalletItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public address = ''

  @property() public profileName = ''

  @property() public alt = ''

  @property({ type: Number }) public amount = 0

  @property() public currency: Intl.NumberFormatOptions['currency'] = 'USD'

  @property() public buttonLabel = ''

  @property() public buttonVariant: ButtonVariant = 'accent'

  @property() public imageSrc = ''

  @property({ type: Boolean }) public loading = false

  @property({ type: Boolean }) public showBalance = true

  @property({ type: Number }) public totalNetworks = 0

  @property({ type: Number }) public charsStart = 2

  @property({ type: Number }) public charsEnd = 3

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" columnGap="3xs">
        ${this.imageTemplate()} ${this.labelAndDescriptionTemplate()} ${this.buttonActionTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  public imageTemplate() {
    return html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`
  }

  public labelAndDescriptionTemplate() {
    return html`
      <wui-flex flexDirection="column" flexGrow="1">
        <wui-text variant="small-500" color="fg-100">
          ${this.profileName || this.address
            ? UiHelperUtil.getTruncateString({
                string: this.profileName || this.address,
                charsStart: this.profileName ? 18 : this.charsStart,
                charsEnd: this.profileName ? 0 : this.charsEnd,
                truncate: this.profileName ? 'end' : 'middle'
              })
            : null}
        </wui-text>
        ${this.balanceTemplate()}
      </wui-flex>
    `
  }

  public buttonActionTemplate() {
    return html`
      <wui-button size="xs" variant=${this.buttonVariant} .loading=${this.loading}>
        ${this.buttonLabel}
      </wui-button>
    `
  }

  public balanceTemplate() {
    const totalNetworksLabel = `${this.totalNetworks} network${this.totalNetworks > 1 ? 's' : ''}`

    if (this.showBalance) {
      return html`<wui-flex alignItems="center" columnGap="3xs">
        <wui-text variant="tiny-500" color="fg-200">
          ${UiHelperUtil.formatCurrency(this.amount, { currency: this.currency })}
        </wui-text>

        <wui-icon class="circle" color="fg-100" size="inherit" name="circle"></wui-icon>

        <wui-text variant="tiny-500" color="fg-200">${totalNetworksLabel}</wui-text>
      </wui-flex>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-inactive-profile-wallet-item': WuiInactiveProfileWalletItem
  }
}
