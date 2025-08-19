import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-toggle/index.js'
import styles from './styles.js'

@customElement('wui-certified-switch')
export class WuiCertifiedSwitch extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public checked?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private handleToggleChange(event: CustomEvent) {
    event.stopPropagation()
    this.checked = event.detail
    this.dispatchSwitchEvent()
  }

  private dispatchSwitchEvent() {
    this.dispatchEvent(
      new CustomEvent('certifiedSwitchChange', {
        detail: this.checked,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-certified-switch': WuiCertifiedSwitch
  }
}
