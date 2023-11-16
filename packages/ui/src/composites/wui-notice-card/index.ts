import { html, LitElement } from 'lit'
import '../../layout/wui-flex/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-button/index.js'
import '../../composites/wui-icon-box/index.js'
import { resetStyles, elementStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { property } from 'lit/decorators.js'
import type { IconType } from '../../utils/TypeUtil.js'

@customElement('wui-notice-card')
export class WuiNoticeCard extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public label = ''

  @property() public description = ''

  @property() public icon: IconType = 'wallet'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button>
        <wui-flex gap="m" alignItems="center" justifyContent="space-between">
          <wui-icon-box
            size="lg"
            iconcolor="accent-100"
            backgroundcolor="accent-100"
            icon=${this.icon}
            background="transparent"
          ></wui-icon-box>

          <wui-flex flexDirection="column" gap="3xs">
            <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>
            <wui-text variant="small-400" color="fg-200">${this.description}</wui-text>
          </wui-flex>

          <wui-icon size="md" color="fg-200" name="chevronRight"></wui-icon>
        </wui-flex>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-notice-card': WuiNoticeCard
  }
}
