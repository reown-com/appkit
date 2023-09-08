import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtils.js'
import '../wui-avatar/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('wui-account-button')
export class WuiAccountButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public networkSrc?: string = undefined

  @property() public avatarSrc?: string = undefined

  @property() public balance?: string = undefined

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public isProfileName = false

  @property() public address = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        ${this.balanceTemplate()}
        <wui-flex
          gap="xxs"
          alignItems="center"
          class=${ifDefined(this.balance ? undefined : 'local-no-balance')}
        >
          <wui-avatar
            .imageSrc=${this.avatarSrc}
            alt=${this.address}
            address=${this.address}
          ></wui-avatar>
          <wui-text variant="paragraph-600" color="inherit">
            ${UiHelperUtil.getTruncateString(
              this.address,
              8,
              this.isProfileName ? 'end' : 'middle'
            )}
          </wui-text>
        </wui-flex>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private balanceTemplate() {
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
