import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { resetStyles } from '../../utils/ThemeUtil'
import type { LogoType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-logo')
export class WuiLogo extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public logo: LogoType = 'google'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-logo': WuiLogo
  }
}
