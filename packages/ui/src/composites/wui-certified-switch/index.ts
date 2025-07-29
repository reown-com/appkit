import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import '@reown/appkit-ui/wui-toggle'

@customElement('wui-certified-switch')
export class WuiCertifiedSwitch extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public checked?: boolean = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle .checked=${this.checked} size="sm"></wui-toggle>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-certified-switch': WuiCertifiedSwitch
  }
}
