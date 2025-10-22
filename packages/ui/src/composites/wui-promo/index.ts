import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-promo')
export class WuiPromo extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button>
      <wui-icon color="accent-primary" size="sm" name="arrowRight"></wui-icon>
      <wui-text variant="sm-regular" color="accent-primary">${this.text}</wui-text>
      <wui-icon color="accent-primary" size="sm" name="arrowTopRight"></wui-icon>
    </button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-promo': WuiPromo
  }
}
