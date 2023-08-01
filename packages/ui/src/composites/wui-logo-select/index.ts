import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import { LogoType } from '../../utils/TypesUtil'
import '../wui-logo'
import styles from './styles'

@customElement('wui-logo-select')
export class WuiLogoSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public logo: LogoType = 'google'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
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
