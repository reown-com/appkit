import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../../components/wui-icon/index.js'
import '../wui-avatar/index.js'
import '../wui-icon-box/index.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'

@customElement('wui-list-select-account')
export class WuiListSelectAccount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() dollars = '0'

  @property() pennies = '00'

  @property() address = ''

  @property() description = 'Email'

  @property() icon: IconType = 'mail'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-avatar size="sm" address=${this.address}></wui-avatar>
        <wui-icon-box
          size="xs"
          iconcolor="fg-200"
          backgroundcolor="fg-300"
          icon=${this.icon}
          background="fg-300"
          borderColor=${undefined}
        ></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="start" justifyContent="center" rowGap="2">
          <wui-text color="primary" variant="lg-regular-mono">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsStart: 4,
              charsEnd: 6,
              truncate: 'middle'
            })}
          </wui-text>

          <wui-text color="secondary" variant="md-regular">${this.description}</wui-text>
        </wui-flex>

        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" columnGap="2">
          <wui-text color="secondary" variant="lg-regular-mono">
            $${this.dollars}<span class="pennies">.${this.pennies}</span>
          </wui-text>
          <wui-icon name="chevronRight" size="md"></wui-icon>
        </wui-flex>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-select-account': WuiListSelectAccount
  }
}
