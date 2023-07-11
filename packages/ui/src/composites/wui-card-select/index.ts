import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import '../wui-wallet-image'
import '../wui-network-image'
import styles from './styles'
import type { CardSelectType } from '../../utils/TypesUtil'

@customElement('wui-card-select')
export class WuiCardSelect extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  @property() public name = 'unknown'

  @property() public type: CardSelectType = 'wallet'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button ?disabled=${this.disabled}>
        ${this.imageTemplate()}
        <wui-text variant="tiny-500" color="inherit">${this.name}</wui-text>
      </button>
    `
  }

  private imageTemplate() {
    if (this.type === 'network') {
      return html`<wui-network-image
        imageSrc=${this.imageSrc}
        name=${this.name}
      ></wui-network-image>`
    }

    return html`<wui-wallet-image
      size="md"
      imageSrc=${this.imageSrc}
      name=${this.name}
    ></wui-wallet-image>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select': WuiCardSelect
  }
}
