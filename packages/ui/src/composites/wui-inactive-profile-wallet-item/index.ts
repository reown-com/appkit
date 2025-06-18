import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-icon-link/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonVariant, IconType, SizeType } from '../../utils/TypeUtil.js'
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

  @property() public buttonLabel = ''

  @property() public buttonVariant: ButtonVariant = 'accent'

  @property() public imageSrc = ''

  @property() public icon?: IconType = undefined

  @property() public iconSize?: SizeType = 'md'

  @property() public iconBadge?: IconType | undefined

  @property() public iconBadgeSize?: SizeType = 'md'

  @property() public rightIcon?: IconType = 'off'

  @property() public rightIconSize?: SizeType = 'md'

  @property({ type: Boolean }) public loading = false

  @property({ type: Number }) public charsStart = 4

  @property({ type: Number }) public charsEnd = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" columnGap="xs">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private imageOrIconTemplate() {
    if (this.icon) {
      return html`
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon
              size=${this.iconSize}
              color="fg-200"
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

    return html`<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`
  }

  public labelAndDescriptionTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="small-500" color="fg-100">
          ${UiHelperUtil.getTruncateString({
            string: this.profileName || this.address,
            charsStart: this.profileName ? 16 : this.charsStart,
            charsEnd: this.profileName ? 0 : this.charsEnd,
            truncate: this.profileName ? 'end' : 'middle'
          })}
        </wui-text>
      </wui-flex>
    `
  }

  public buttonActionTemplate() {
    return html`
      <wui-flex columnGap="3xs" alignItems="center" justifyContent="center">
        <wui-button
          size="xs"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          iconColor="fg-200"
          size=${this.rightIconSize}
          icon=${this.rightIcon}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `
  }

  private handleButtonClick() {
    this.dispatchEvent(new CustomEvent('buttonClick', { bubbles: true, composed: true }))
  }

  private handleIconClick() {
    this.dispatchEvent(new CustomEvent('iconClick', { bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-inactive-profile-wallet-item': WuiInactiveProfileWalletItem
  }
}
