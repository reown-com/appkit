import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { LogoType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-logo/index.js'
import styles from './styles.js'

@customElement('wui-logo-select')
export class WuiLogoSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public logo: LogoType = 'google'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-logo logo=${this.logo}></wui-logo>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-logo-select': WuiLogoSelect
  }
}
