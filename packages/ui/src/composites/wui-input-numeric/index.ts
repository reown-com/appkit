import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'

import styles from './styles'

@customElement('wui-input-numeric')
export class WuiInputNumeric extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`<input type="tel" inputmode="numeric" maxlength="1" ?disabled=${this.disabled} /> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-numeric': WuiInputNumeric
  }
}
