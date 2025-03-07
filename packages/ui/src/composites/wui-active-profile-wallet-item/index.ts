import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { TagType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-button/index.js'
import '../wui-tag/index.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

@customElement('wui-active-profile-wallet-item')
export class WuiActiveProfileWalletItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public address = ''

  @property() public profileName = ''

  @property() public alt = ''

  @property({ type: Number }) public amount = 0

  @property() public currency: Intl.NumberFormatOptions['currency'] = 'USD'

  @property() public tagLabel = ''

  @property() public tagVariant: TagType = 'success'

  @property() public imageSrc = ''

  @property({ type: Number }) public totalNetworks = 0

  @property({ type: Number }) public charsStart = 2

  @property({ type: Number }) public charsEnd = 3

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" rowGap="xs">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  public topTemplate() {
    return html`
      <wui-flex alignItems="center" justifyContent="space-between" columnGap="xl">
        <wui-flex flexGrow="1" alignItems="center">
          <wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>
        </wui-flex>

        <wui-icon color="fg-275" size="md" name="copy" @click=${this.dispatchCopyEvent}></wui-icon>
        <wui-icon
          color="fg-275"
          size="md"
          name="off"
          @click=${this.dispatchDisconnectEvent}
        ></wui-icon>
      </wui-flex>
    `
  }

  public bottomTemplate() {
    return html`
      <wui-flex flexDirection="column" rowGap="3xs">
        ${this.labelAndTagTemplate()} ${this.labelAndDescriptionTemplate()}
      </wui-flex>
    `
  }

  private labelAndTagTemplate() {
    return html`
      <wui-flex alignItems="center" columnGap="3xs">
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

        <wui-tag variant=${this.tagVariant} size="xs">${this.tagLabel}</wui-tag>
      </wui-flex>
    `
  }

  public labelAndDescriptionTemplate() {
    const totalNetworksLabel = `${this.totalNetworks} network${this.totalNetworks > 1 ? 's' : ''}`

    return html`
      <wui-flex alignItems="center" columnGap="3xs">
        <wui-text variant="tiny-500" color="fg-200">
          ${UiHelperUtil.formatCurrency(this.amount, { currency: this.currency })}
        </wui-text>

        <wui-icon class="circle" color="fg-100" size="inherit" name="circle"></wui-icon>

        <wui-text variant="tiny-500" color="fg-200">${totalNetworksLabel}</wui-text>
      </wui-flex>
    `
  }

  private dispatchDisconnectEvent() {
    this.dispatchEvent(new CustomEvent('disconnect', { bubbles: true, composed: true }))
  }

  private dispatchCopyEvent() {
    this.dispatchEvent(new CustomEvent('copy', { bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-active-profile-wallet-item': WuiActiveProfileWalletItem
  }
}
