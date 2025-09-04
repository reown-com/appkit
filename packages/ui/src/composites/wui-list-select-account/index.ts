import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import styles from './styles.js'

@customElement('wui-list-select-account')
export class WuiListSelectAccount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() address = ''

  @property() description = 'Email'

  @property() icon: IconType = 'mail'

  @property() currency: Intl.NumberFormatOptions['currency'] = 'USD'

  @property({ type: Number }) amount = 0

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        <wui-avatar size="sm" address=${this.address}></wui-avatar>
        <wui-icon class="avatarIcon" size="xs" name=${this.icon}></wui-icon>

        <wui-flex
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          flexGrow="1"
          flexShrink="0"
          rowGap="2"
          class="description"
        >
          <wui-text color="primary" variant="lg-regular">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsStart: 4,
              charsEnd: 4,
              truncate: 'middle'
            })}
          </wui-text>

          <wui-text color="secondary" variant="md-regular" lineClamp="1">
            ${this.description}
          </wui-text>
        </wui-flex>

        <wui-flex
          flexGrow="1"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          columnGap="2"
        >
          <wui-text color="secondary" variant="lg-regular-mono" lineClamp="1">
            ${UiHelperUtil.formatCurrency(this.amount, { currency: this.currency })}
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
