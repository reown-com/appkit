import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import '../wui-wallet-image'
import styles from './styles'

@customElement('wui-card-select')
export class WuiCardSelect extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  @property() public name = ''

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button ?disabled=${this.disabled}>
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
