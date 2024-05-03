import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import '../../components/wui-text/index.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'

@customElement('wui-promo')
export class WuiPromo extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button ontouchstart>
      <wui-text variant="small-600" color="bg-100">${this.text}</wui-text>
      <wui-icon color="bg-100" size="xs" name="arrowRight"></wui-icon>
    </button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-promo': WuiPromo
  }
}
