import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-loading-spinner')
export class WuiLoadingSpinner extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-loading-spinner': WuiLoadingSpinner
  }
}
