import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import '../wui-icon-box/index.js'
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

  @property({ type: Boolean }) public isProfileName = false

  @property() public address = ''

  @property() public charsStart = 4

  @property() public charsEnd = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button
        ?disabled=${this.disabled}
        class=${ifDefined(this.balance ? undefined : 'local-no-balance')}
      >
        ${this.balanceTemplate()}
        <wui-flex gap="xxs" alignItems="center">
          <wui-avatar
            .imageSrc=${this.avatarSrc}
            alt=${this.address}
            address=${this.address}
          ></wui-avatar>
          <wui-text variant="paragraph-600" color="inherit">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsStart: this.isProfileName ? 18 : this.charsStart,
              charsEnd: this.isProfileName ? 0 : this.charsEnd,
              truncate: this.isProfileName ? 'end' : 'middle'
            })}
          </wui-text>
        </wui-flex>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private balanceTemplate() {
    if (this.isUnsupportedChain) {
      return html` <wui-icon-box
          size="sm"
          iconColor="error-100"
          backgroundColor="error-100"
          icon="warningCircle"
        ></wui-icon-box>
        <wui-text variant="paragraph-600" color="inherit"> Switch Network</wui-text>`
    }
    if (this.balance) {
      const networkElement = this.networkSrc
        ? html`<wui-image src=${this.networkSrc}></wui-image>`
        : html`
            <wui-icon-box
              size="sm"
              iconColor="fg-200"
              backgroundColor="fg-300"
              icon="networkPlaceholder"
            ></wui-icon-box>
          `

      return html`
        ${networkElement}
        <wui-text variant="paragraph-600" color="inherit"> ${this.balance} </wui-text>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-account-button': WuiAccountButton
  }
}
