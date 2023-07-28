import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/wui-text'
import { resetStyles } from '../../utils/ThemeUtil'
import '../wui-icon-box'
import styles from './styles'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //

  public firstUpdated() {
    const slot = this.shadowRoot?.querySelector('slot')
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
