import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonVariant, TagType } from '../../utils/TypeUtil.js'
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

  @property() public domainName = ''

  @property() public alt = ''

  @property({ type: Number }) public amount = 0

  @property() public tagLabel = ''

  @property() public tagVariant: TagType = 'success'

  @property() public imageSrc = ''

  @property() public buttonVariant: ButtonVariant = 'neutral'

  @property({ type: Boolean }) public loading = false

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
      <wui-flex alignItems="center" justifyContent="space-between" columnGap="s">
        <wui-flex flexGrow="1" alignItems="center">
          <wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>
        </wui-flex>

        <wui-icon color="fg-275" size="md" name="copy" @click=${this.dispatchCopyEvent}></wui-icon>
        <wui-icon
          color="fg-275"
          size="md"
          name="externalLink"
          @click=${this.dispatchExternalLinkEvent}
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
    if (this.domainName) {
      return html`
        <wui-flex alignItems="center" columnGap="3xs">
          <wui-text variant="small-500" color="fg-100">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsStart: this.charsStart,
              charsEnd: this.charsEnd,
              truncate: 'middle'
            })}
          </wui-text>

          <wui-tag variant=${this.tagVariant} size="xs">${this.tagLabel}</wui-tag>
        </wui-flex>
      `
    }

    return html`
      <wui-flex justifyContent="space-between" alignItems="center" columnGap="3xs">
        <wui-flex alignItems="center" columnGap="3xs">
          <wui-text variant="small-500" color="fg-100">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsStart: this.charsStart,
              charsEnd: this.charsEnd,
              truncate: 'middle'
            })}
          </wui-text>

          <wui-tag variant=${this.tagVariant} size="xs">${this.tagLabel}</wui-tag>
        </wui-flex>

        ${this.disconnectTemplate()}
      </wui-flex>
    `
  }

  public labelAndDescriptionTemplate() {
    if (!this.domainName) {
      return null
    }

    return html`
      <wui-flex alignItems="center" columnGap="3xs">
        <wui-text variant="tiny-500" color="fg-200">${this.domainName}</wui-text>
        ${this.disconnectTemplate()}
      </wui-flex>
    `
  }

  public disconnectTemplate() {
    return html`
      <wui-button
        size="xs"
        variant=${this.buttonVariant}
        .loading=${this.loading}
        @click=${this.dispatchDisconnectEvent}
      >
        Disconnect
      </wui-button>
    `
  }

  private dispatchDisconnectEvent() {
    this.dispatchEvent(new CustomEvent('disconnect', { bubbles: true, composed: true }))
  }

  private dispatchExternalLinkEvent() {
    this.dispatchEvent(new CustomEvent('externalLink', { bubbles: true, composed: true }))
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
