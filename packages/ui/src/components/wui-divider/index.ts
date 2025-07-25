import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-text/index.js'
import styles from './styles.js'

@customElement('wui-divider')
export class WuiDivider extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public text? = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`${this.template()}`
  }

  // -- Private ------------------------------------------- //
  private template() {
    if (this.text) {
      return html`<wui-text variant="md-regular" color="inherit">${this.text}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-divider': WuiDivider
  }
}
