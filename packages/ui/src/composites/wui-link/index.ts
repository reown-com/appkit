import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-link')
export class WuiLink extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button ?disabled=${this.disabled} @click=${this.onClick.bind(this)}>
        <slot name="iconLeft"></slot>
        <wui-text variant="small-600" color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-link': WuiLink
  }
}
