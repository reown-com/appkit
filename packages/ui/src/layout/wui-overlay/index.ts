import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-overlay')
export class WuiOverlay extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //

  public override render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-overlay': WuiOverlay
  }
}
