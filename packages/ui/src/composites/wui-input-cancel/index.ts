import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { closeSvg } from '../../assets/svg/close'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-icon'
import styles from './styles'

@customElement('wui-input-cancel')
export class WuiInputCancel extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- render ------------------------------------------------------- //
  public render() {
    return html`
      <button @click=${this.onClick.bind(this)}>
        <wui-icon color="bg-200" size="xxs">${closeSvg}</wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-cancel': WuiInputCancel
  }
}
