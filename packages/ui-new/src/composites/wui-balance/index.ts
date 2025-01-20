import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-balance')
export class WuiBalance extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() dollars = '0'

  @property() pennies = '00'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<span>$${this.dollars}<span class="pennies">.${this.pennies}</span></span>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-balance': WuiBalance
  }
}
