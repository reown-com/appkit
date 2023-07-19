import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import { LogoType } from '../../utils/TypesUtil'

@customElement('wui-logo')
export class WuiLogo extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public logo: LogoType = 'google'

  // -- Render -------------------------------------------- //
  public render() {
    return html`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-logo': WuiLogo
  }
}
