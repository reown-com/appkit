import { LitElement, html } from 'lit'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-card')
export class WuiCard extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card': WuiCard
  }
}
