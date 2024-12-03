import { AlertController } from '@reown/appkit-core'
import { html, LitElement } from 'lit'
import '../../components/wui-text/index.js'
import '../../components/wui-icon/index.js'
import { property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { ToastMessageVariant } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
const ICON_BY_VARIANT = {
  info: 'info',
  success: 'checkmark',
  warning: 'warningCircle',
  error: 'exclamationTriangle'
}

// @TODO: Replace <wui-icon> with <wui-icon-box>
@customElement('wui-toast-message')
export class WuiToastMessage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public message = ''

  @property() public variant: ToastMessageVariant = 'info'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant

    return html`
      <wui-icon name=${ICON_BY_VARIANT[this.variant]}></wui-icon>
      <wui-text variant="md-medium" color="primary" data-testid="wui-toast-message-text">
        ${this.message}
      </wui-text>
      <wui-icon size="lg" name="close" @click=${this.onClose}></wui-icon>
    `
  }

  // -- Private ------------------------------------------- //
  private onClose() {
    AlertController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-toast-message': WuiToastMessage
  }
}
