import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import styles from './styles.js'

@customElement('wui-account-button')
export class WuiAccountButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public networkSrc?: string = undefined

  @property() public avatarSrc?: string = undefined

  @property() public balance?: string = undefined

  @property({ type: Boolean }) public isUnsupportedChain?: boolean = undefined

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public loading = false

  @property() public address = ''

  @property() public profileName = ''

  @property() public charsStart = 4

  @property() public charsEnd = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button
        ?disabled=${this.disabled}
        class=${ifDefined(this.balance ? undefined : 'local-no-balance')}
        data-error=${ifDefined(this.isUnsupportedChain)}
      >
        ${this.imageTemplate()} ${this.addressTemplate()} ${this.balanceTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    const networkElement = this.networkSrc
      ? html`<wui-image src=${this.networkSrc}></wui-image>`
      : html` <wui-icon size="inherit" color="inherit" name="networkPlaceholder"></wui-icon> `

    return html`<wui-flex class="avatar-container">
      <wui-avatar
        .imageSrc=${this.avatarSrc}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>

      <wui-flex class="network-image-container">${networkElement}</wui-flex>
    </wui-flex>`
  }

  private addressTemplate() {
    return html`<wui-text variant="md-regular" color="inherit">
      ${this.address
        ? UiHelperUtil.getTruncateString({
            string: this.profileName || this.address,
            charsStart: this.profileName ? 18 : this.charsStart,
            charsEnd: this.profileName ? 0 : this.charsEnd,
            truncate: this.profileName ? 'end' : 'middle'
          })
        : null}
    </wui-text>`
  }

  private balanceTemplate() {
    if (this.balance) {
      const balanceTemplate = this.loading
        ? html`<wui-loading-spinner size="md" color="inherit"></wui-loading-spinner>`
        : html`<wui-text variant="md-regular" color="inherit"> ${this.balance}</wui-text>`

      return html`<wui-flex alignItems="center" justifyContent="center" class="balance-container"
        >${balanceTemplate}</wui-flex
      >`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-account-button': WuiAccountButton
  }
}
