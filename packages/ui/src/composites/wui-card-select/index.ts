import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../components/wui-text'
import '../wui-wallet-image'
import styles from './styles'

@customElement('wui-card-select')
export class WuiCardSelect extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //

  @property() public imageSrc = ''

  @property() public name = ''

  @property({ type: Boolean }) public disabled = false

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- render ------------------------------------------------------- //
  public render() {
    return html`
      <button ?disabled=${this.disabled} @click=${this.onClick.bind(this)}>
        <wui-wallet-image size="md" src=${this.imageSrc} alt=${this.name}></wui-wallet-image>
        <wui-text variant="tiny-500" color="inherit">${this.name}</wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select': WuiCardSelect
  }
}
