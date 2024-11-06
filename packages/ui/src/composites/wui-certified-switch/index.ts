import { LitElement, html } from 'lit'
import styles from './styles.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { property } from 'lit/decorators.js'

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
        <wui-switch ?checked=${ifDefined(this.checked)}></wui-switch>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-certified-switch': WuiCertifiedSwitch
  }
}
