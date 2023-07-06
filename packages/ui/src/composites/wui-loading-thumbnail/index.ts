import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-loading-thumbnail')
export class WuiLoadingThumbnail extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- state & properties ------------------------------------------- //

  @property({ type: Boolean }) public loading = true

  // -- render ------------------------------------------------------- //

  public render() {
    return html`
      <svg data-loading=${this.loading} viewBox="0 0 110 110" width="110" height="110">
        <rect id="wui-thumbnail-loading" x="2" y="2" width="100" height="100" rx="36" />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-loading-thumbnail': WuiLoadingThumbnail
  }
}
