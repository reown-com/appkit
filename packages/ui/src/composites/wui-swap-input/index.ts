import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../wui-transaction-visual/index.js'

import styles from './styles.js'
import { createRef, ref } from 'lit/directives/ref.js'

type Currency = {
  name: string
  symbol: string
  image?: string
}

@customElement('wui-swap-input')
export class WuiSwapInput extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public focused = false

  @property({ type: Boolean }) public disabled?: boolean

  @property({ type: Object }) public currency?: Currency

  @property() public onSelect?: () => void

  @property() public value?: string

  public inputElementRef = createRef<HTMLInputElement>()

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex class="${this.focused ? 'focus' : ''}" justifyContent="space-between">
        <wui-flex flex="1" class="swap-input">
          <input
            ${ref(this.inputElementRef)}
            @focusin=${() => this.onFocusChange(true)}
            @focusout=${() => this.onFocusChange(false)}
            .value=${this.value}
            ?disabled=${this.disabled}
            @input=${this.dispatchInputChangeEvent.bind(this)}
            type="number"
            placeholder="0"
          />
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTokenSelectButton() {
    if (!this.currency) {
      return html` <wui-button size="md" variant="accentBg" @click=${this.onSelect?.bind(this)}>
        Select
      </wui-button>`
    }

    const currencyElement = this.currency.image
      ? html`<wui-image src=${this.currency.image}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <div class="currency-select-button-container" @click=${this.onSelect?.bind(this)}>
        <button class="currency-select-button">
          ${currencyElement}
          <wui-text variant="paragraph-600" color="fg-100">${this.currency.symbol}</wui-text>
        </button>
      </div>
    `
  }

  private onFocusChange(state: boolean) {
    this.focused = state
  }

  private dispatchInputChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('inputChange', {
        detail: this.inputElementRef.value?.value,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-swap-input': WuiSwapInput
  }
}
