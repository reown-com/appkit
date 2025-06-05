import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, SizeType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-wallet-switch')
export class WuiWalletSwitch extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public address = ''

  @property() public profileName = ''

  @property() public alt = ''

  @property() public imageSrc = ''

  @property() public icon?: IconType = undefined

  @property() public iconSize?: SizeType = 'md'

  @property({ type: Boolean }) public loading = false

  @property({ type: Number }) public charsStart = 4

  @property({ type: Number }) public charsEnd = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftImageTemplate() {
    const imageOrIconContent = this.icon
      ? html`<wui-icon
          size=${this.iconSize}
          color="fg-200"
          name=${this.icon}
          class="icon"
        ></wui-icon>`
      : html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`

    return html`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${Boolean(this.icon)}
      >
        ${imageOrIconContent}
        <wui-flex class="circle"></wui-flex>
      </wui-flex>
    `
  }
  public textTemplate() {
    return html`
      <wui-text variant="paragraph-500" color="fg-100">
        ${UiHelperUtil.getTruncateString({
          string: this.profileName || this.address,
          charsStart: this.profileName ? 16 : this.charsStart,
          charsEnd: this.profileName ? 0 : this.charsEnd,
          truncate: this.profileName ? 'end' : 'middle'
        })}
      </wui-text>
    `
  }

  public rightImageTemplate() {
    return html`<wui-icon name="chevronBottom" size="xs" color="fg-200"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-switch': WuiWalletSwitch
  }
}
