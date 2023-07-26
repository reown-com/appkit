import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { CardSelectType } from '../../utils/TypesUtil'
import '../wui-network-image'
import '../wui-wallet-image'
import styles from './styles'

@customElement('wui-card-select')
export class WuiCardSelect extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public name = 'unknown'

  @property() public type: CardSelectType = 'wallet'

  @property() public imageSrc?: string = undefined

  @property({ type: Boolean }) public disabled?: boolean = false

  @property({ type: Boolean }) public selected?: boolean = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button data-selected=${ifDefined(this.selected)} ?disabled=${this.disabled}>
        ${this.imageTemplate()}
        <wui-text variant="tiny-500" color=${this.selected ? 'blue-100' : 'inherit'}>
          ${this.name}
        </wui-text>
      </button>
    `
  }

  private imageTemplate() {
    if (this.type === 'network') {
      return html`
        <wui-network-image
          .selected=${this.selected}
          imageSrc=${ifDefined(this.imageSrc)}
          name=${this.name}
        >
        </wui-network-image>
      `
    }

    return html`
      <wui-wallet-image size="md" imageSrc=${ifDefined(this.imageSrc)} name=${this.name}>
      </wui-wallet-image>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select': WuiCardSelect
  }
}
