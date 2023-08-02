import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../wui-logo'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import { LogoType } from '../../utils/TypesUtil'

@customElement('wui-logo-select')
export class WuiLogoSelect extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public logo: LogoType = 'google'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public render() {
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
