import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-icon-link/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonVariant, IconSizeType, IconType, TagType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-button/index.js'
import '../wui-tag/index.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

// -- Types --------------------------------------------- //
type ContentItem = {
  address: string
  profileName?: string
  alignItems?: 'center' | 'flex-start' | 'flex-end'
  label?: string
  description?: string
  tagLabel: string
  tagVariant: TagType
  enableButton?: boolean
  buttonType: 'disconnect' | 'switch'
  buttonLabel: string
  buttonVariant: ButtonVariant
}

@customElement('wui-active-profile-wallet-item')
export class WuiActiveProfileWalletItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public address = ''

  @property() public profileName = ''

  @property({ type: Array }) public content: ContentItem[] = []

  @property() public alt = ''

  @property() public imageSrc = ''

  @property() public icon?: IconType = undefined

  @property() public iconSize?: IconSizeType = 'md'

  @property() public iconBadge?: IconType | undefined = undefined

  @property() public iconBadgeSize?: IconSizeType = 'md'

  @property() public buttonVariant: ButtonVariant = 'neutral-primary'

  @property({ type: Boolean }) public enableMoreButton = false

  @property({ type: Number }) public charsStart = 4

  @property({ type: Number }) public charsEnd = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" rowgap="2">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  public topTemplate() {
    return html`
      <wui-flex alignItems="flex-start" justifyContent="space-between">
        ${this.imageOrIconTemplate()}
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="copy"
          @click=${this.dispatchCopyEvent}
        ></wui-icon-link>
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon-link>
        ${this.enableMoreButton
          ? html`<wui-icon-link
              variant="secondary"
              size="md"
              icon="threeDots"
              @click=${this.dispatchMoreButtonEvent}
              data-testid="wui-active-profile-wallet-item-more-button"
            ></wui-icon-link>`
          : null}
      </wui-flex>
    `
  }

  public bottomTemplate() {
    return html` <wui-flex flexDirection="column">${this.contentTemplate()}</wui-flex> `
  }

  private imageOrIconTemplate() {
    if (this.icon) {
      return html`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge
              ? html`<wui-icon
                  color="accent-primary"
                  size="inherit"
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
        <wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `
  }

  private contentTemplate() {
    if (this.content.length === 0) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" rowgap="3">
        ${this.content.map(item => this.labelAndTagTemplate(item))}
      </wui-flex>
    `
  }

  private labelAndTagTemplate({
    address,
    profileName,
    label,
    description,
    enableButton,
    buttonType,
    buttonLabel,
    buttonVariant,
    tagVariant,
    tagLabel,
    alignItems = 'flex-end'
  }: ContentItem) {
    return html`
      <wui-flex justifyContent="space-between" alignItems=${alignItems} columngap="1">
        <wui-flex flexDirection="column" rowgap="01">
          ${label
            ? html`<wui-text variant="sm-medium" color="secondary">${label}</wui-text>`
            : null}

          <wui-flex alignItems="center" columngap="1">
            <wui-text variant="md-regular" color="primary">
              ${UiHelperUtil.getTruncateString({
                string: profileName || address,
                charsStart: profileName ? 16 : this.charsStart,
                charsEnd: profileName ? 0 : this.charsEnd,
                truncate: profileName ? 'end' : 'middle'
              })}
            </wui-text>

            ${tagVariant && tagLabel
              ? html`<wui-tag variant=${tagVariant} size="sm">${tagLabel}</wui-tag>`
              : null}
          </wui-flex>

          ${description
            ? html`<wui-text variant="sm-regular" color="secondary">${description}</wui-text>`
            : null}
        </wui-flex>

        ${enableButton ? this.buttonTemplate({ buttonType, buttonLabel, buttonVariant }) : null}
      </wui-flex>
    `
  }

  public buttonTemplate({
    buttonType,
    buttonLabel,
    buttonVariant
  }: Pick<ContentItem, 'buttonType' | 'buttonLabel' | 'buttonVariant'>) {
    return html`
      <wui-button
        size="sm"
        variant=${buttonVariant}
        @click=${buttonType === 'disconnect'
          ? this.dispatchDisconnectEvent.bind(this)
          : this.dispatchSwitchEvent.bind(this)}
        data-testid=${buttonType === 'disconnect'
          ? 'wui-active-profile-wallet-item-disconnect-button'
          : 'wui-active-profile-wallet-item-switch-button'}
      >
        ${buttonLabel}
      </wui-button>
    `
  }

  private dispatchDisconnectEvent() {
    this.dispatchEvent(new CustomEvent('disconnect', { bubbles: true, composed: true }))
  }

  private dispatchSwitchEvent() {
    this.dispatchEvent(new CustomEvent('switch', { bubbles: true, composed: true }))
  }

  private dispatchExternalLinkEvent() {
    this.dispatchEvent(new CustomEvent('externalLink', { bubbles: true, composed: true }))
  }

  private dispatchMoreButtonEvent() {
    this.dispatchEvent(new CustomEvent('more', { bubbles: true, composed: true }))
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
