import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonVariant, IconType, SizeType, TagType } from '../../utils/TypeUtil.js'
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

  @property() public description = ''

  @property() public alt = ''

  @property() public tagLabel = ''

  @property() public tagVariant: TagType = 'success'

  @property() public imageSrc = ''

  @property() public icon?: IconType = undefined

  @property() public iconSize?: SizeType = 'md'

  @property() public iconBadge?: IconType | undefined = undefined

  @property() public iconBadgeSize?: SizeType = 'md'

  @property() public buttonVariant: ButtonVariant = 'neutral'

  @property({ type: Number }) public charsStart = 4

  @property({ type: Number }) public charsEnd = 6

  @property({ type: Boolean }) public confirmation = false

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
        ${this.imageOrIconTemplate()}
        <wui-icon color="fg-275" size="xs" name="copy" @click=${this.dispatchCopyEvent}></wui-icon>
        <wui-icon
          color="fg-275"
          size="xs"
          name="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon>
      </wui-flex>
    `
  }

  public bottomTemplate() {
    return html`
      <wui-flex flexDirection="column">
        ${this.labelAndTagTemplate()} ${this.labelAndDescriptionTemplate()}
      </wui-flex>
    `
  }

  private imageOrIconTemplate() {
    if (this.icon) {
      return html`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon
              size=${this.iconSize}
              color="fg-275"
              name=${this.icon}
              class="custom-icon"
            ></wui-icon>

            ${this.iconBadge
              ? html`<wui-icon
                  color="fg-175"
                  size=${this.iconBadgeSize}
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`
              : null}
          </wui-flex>
        </wui-flex>
      `
    }

    return html`
      <wui-flex flexGrow="1" alignItems="center">
        <wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `
  }

  private labelAndTagTemplate() {
    if (this.description) {
      return html`
        <wui-flex alignItems="center" columnGap="3xs">
          <wui-text variant="small-500" color="fg-100">
            ${UiHelperUtil.getTruncateString({
              string: this.profileName || this.address,
              charsStart: this.profileName ? 16 : this.charsStart,
              charsEnd: this.profileName ? 0 : this.charsEnd,
              truncate: this.profileName ? 'end' : 'middle'
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
              string: this.profileName || this.address,
              charsStart: this.profileName ? 16 : this.charsStart,
              charsEnd: this.profileName ? 0 : this.charsEnd,
              truncate: this.profileName ? 'end' : 'middle'
            })}
          </wui-text>

          <wui-tag variant=${this.tagVariant} size="xs">${this.tagLabel}</wui-tag>
        </wui-flex>

        ${this.disconnectTemplate()}
      </wui-flex>
    `
  }

  public labelAndDescriptionTemplate() {
    if (!this.description) {
      return null
    }

    return html`
      <wui-flex alignItems="center" justifyContent="space-between" columnGap="3xs">
        <wui-text variant="tiny-500" color="fg-200">${this.description}</wui-text>
        ${this.disconnectTemplate()}
      </wui-flex>
    `
  }

  public disconnectTemplate() {
    if (this.confirmation) {
      return html`
        <wui-flex alignItems="center" columnGap="1xs" class="confirmation-box">
          <wui-text variant="tiny-600" color="fg-200"> Disconnect </wui-text>

          <wui-icon
            color="error-100"
            size="xs"
            name="x-mark"
            @click=${this.dispatchToggleConfirmationEvent.bind(this)}
          ></wui-icon>
          <wui-icon
            color="success-100"
            size="xs"
            name="checkmarkBold"
            @click=${this.dispatchDisconnectEvent}
          ></wui-icon>
        </wui-flex>
      `
    }

    return html`
      <wui-button
        size="xs"
        variant=${this.buttonVariant}
        @click=${this.dispatchToggleConfirmationEvent.bind(this)}
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

  private dispatchToggleConfirmationEvent() {
    this.dispatchEvent(new CustomEvent('toggleConfirmation', { bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-active-profile-wallet-item': WuiActiveProfileWalletItem
  }
}
