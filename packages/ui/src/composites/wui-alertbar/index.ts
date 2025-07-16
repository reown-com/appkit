import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AlertController } from '@reown/appkit-controllers'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { AlertType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const TYPE_ICON_NAME = {
  info: 'info',
  success: 'checkmark',
  warning: 'warningCircle',
  error: 'warning'
} as Record<AlertType, IconType>

@customElement('wui-alertbar')
export class WuiAlertBar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public message = ''

  @property() public type: AlertType = 'info'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        data-type=${ifDefined(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${TYPE_ICON_NAME[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onClose() {
    AlertController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-alertbar': WuiAlertBar
  }
}
