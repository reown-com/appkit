import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text'
import { resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType } from '../../utils/TypesUtil'
import '../wui-icon-box'
import styles from './styles'

@customElement('wui-snackbar')
export class WuiSnackbar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public backgroundColor: ColorType = 'blue-100'

  @property() public iconColor: ColorType = 'blue-100'

  @property() public icon: IconType = 'checkmark'

  @property() public message = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-icon-box
        size="sm"
        iconColor=${this.iconColor}
        backgroundColor=${this.backgroundColor}
        icon=${this.icon}
      ></wui-icon-box>
      <wui-text variant="paragraph-500" color="fg-100">${this.message}</wui-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-snackbar': WuiSnackbar
  }
}
