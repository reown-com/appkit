import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
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

  @property({ type: Boolean }) public loading = false

  @property({ type: Number }) public charsStart = 2

  @property({ type: Number }) public charsEnd = 3

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
          <wui-icon
            size=${this.iconSize}
            color="fg-275"
            name=${this.icon}
            class="custom-icon"
          ></wui-icon>
        </wui-flex>
      `
    }

    return html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`
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
          ${this.profileName
            ? this.profileName
            : UiHelperUtil.getTruncateString({
                string: this.address,
                charsStart: this.charsStart,
                charsEnd: this.charsEnd,
                truncate: 'middle'
              })}
        </wui-text>
      </wui-flex>
    `
  }

  public buttonActionTemplate() {
    return html`
      <wui-button
        size="xs"
        variant=${this.buttonVariant}
        .loading=${this.loading}
        @click=${this.handleClick}
      >
        ${this.buttonLabel}
      </wui-button>
    `
  }

  private handleClick() {
    this.dispatchEvent(new CustomEvent('buttonClick'))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-inactive-profile-wallet-item': WuiInactiveProfileWalletItem
  }
}
