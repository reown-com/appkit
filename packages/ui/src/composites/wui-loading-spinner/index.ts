import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-loading-spinner')
export class WuiLoadingSpinner extends LitElement {
  public static styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public render() {
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
