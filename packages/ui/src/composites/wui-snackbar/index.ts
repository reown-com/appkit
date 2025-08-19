import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-snackbar')
export class WuiSnackbar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public message = ''

  @property() public variant: 'success' | 'error' | 'warning' | 'info' | 'loading' = 'success'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `
  }

  // -- Private ------------------------------------------- //
  private templateIcon() {
    const COLOR = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'default'
    } as const

    const ICON = {
      success: 'checkmark',
      error: 'warning',
      warning: 'warningCircle',
      info: 'info'
    } as const

    if (this.variant === 'loading') {
      return html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`
    }

    return html`<wui-icon-box
      size="md"
      color=${COLOR[this.variant]}
      icon=${ICON[this.variant]}
    ></wui-icon-box>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-snackbar': WuiSnackbar
  }
}
