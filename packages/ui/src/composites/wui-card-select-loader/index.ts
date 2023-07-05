import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import '../../components/wui-shimmer'
import styles from './styles'

@customElement('wui-card-select-loader')
export class WuiCardSelectLoader extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- render ------------------------------------------------------- //
  public render() {
    return html`
      <wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select-loader': WuiCardSelectLoader
  }
}
