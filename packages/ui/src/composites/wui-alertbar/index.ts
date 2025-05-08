import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { AlertController } from '@reown/appkit-controllers'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-alertbar')
export class WuiAlertBar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public message = ''

  @property() public backgroundColor: ColorType = 'accent-100'

  @property() public iconColor: ColorType = 'accent-100'

  @property() public icon: IconType = 'info'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-icon-bg-value: var(--wui-color-${this.backgroundColor});
   `

    return html`
      <wui-flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <wui-flex columnGap="xs" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color=${this.iconColor} size="md" name=${this.icon}></wui-icon>
          </wui-flex>
          <wui-text variant="small-500" color="bg-350" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="bg-350"
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
