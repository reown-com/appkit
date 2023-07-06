import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-icon-link')
export class WuiIconLink extends LitElement {
  public static styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- Render -------------------------------------------- //
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
