import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles, colorStyles } from '../../utils/ThemeUtil'
import '../../components/wui-icon'
import styles from './styles'
import type { SizeType } from '../../utils/TypesUtil'

@customElement('wui-icon-link')
export class WuiIconLink extends LitElement {
  public static styles = [globalStyles, colorStyles, styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: SizeType = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- render ------------------------------------------------------- //
  public render() {
    return html`<button ?disabled=${this.disabled} @click=${this.onClick.bind(this)}>
      <wui-icon color="inherit" size=${this.size}><slot></slot></wui-icon>
    </button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-link': WuiIconLink
  }
}
