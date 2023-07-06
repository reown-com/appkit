import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-loading-spinner')
export class WuiLoadingSpinner extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- state & properties ------------------------------------------- //

  @property({ type: Boolean }) public loading = true

  // -- render ------------------------------------------------------- //

  public render() {
    return html`<svg data-loading=${this.loading} viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-loading-spinner': WuiLoadingSpinner
  }
}
