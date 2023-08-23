import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { CardSelectType } from '../../utils/TypesUtil.js'
import '../wui-network-image/index.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

@customElement('wui-card-select')
export class WuiCardSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public name = 'unknown'

  @property() public type: CardSelectType = 'wallet'

  @property() public imageSrc?: string = undefined

  @property({ type: Boolean }) public disabled?: boolean = false

  @property({ type: Boolean }) public selected?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-selected=${ifDefined(this.selected)} ?disabled=${this.disabled} ontouchstart>
        ${this.imageTemplate()}
        <wui-text variant="tiny-500" color=${this.selected ? 'accent-100' : 'inherit'}>
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
