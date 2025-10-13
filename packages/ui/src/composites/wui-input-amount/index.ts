import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import { vars } from '../../utils/ThemeHelperUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-input-amount')
export class WuiInputAmount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property({ type: String }) public value = ''

  @property({ type: String }) public placeholder = '0'

  @property({ type: String }) public widthVariant: 'fit' | 'auto' = 'auto'

  @property({ type: Number }) public maxDecimals?: number = undefined

  @property({ type: Number }) public maxIntegers?: number = undefined

  @property({ type: String }) public fontSize: keyof typeof vars.textSize = 'h4'

  @property({ type: Boolean }) public error = false

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.resizeInput()
  }

  public override updated() {
    this.style.setProperty('--local-font-size', vars.textSize[this.fontSize])
    this.resizeInput()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['widthVariant'] = this.widthVariant
    this.dataset['error'] = String(this.error)

    if (this.inputElementRef?.value && this.value) {
      this.inputElementRef.value.value = this.value
    }

    if (this.widthVariant === 'auto') {
      return this.inputTemplate()
    }

    return html`
      <div class="wui-input-amount-fit-width">
        <span class="wui-input-amount-fit-mirror"></span>
        ${this.inputTemplate()}
      </div>
    `
  }

  // -- Private ------------------------------------------- //
  private inputTemplate() {
    return html`<input
      ${ref(this.inputElementRef)}
      type="text"
      inputmode="decimal"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value ?? ''}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    />`
  }

  private dispatchInputChangeEvent() {
    if (this.inputElementRef.value) {
      this.inputElementRef.value.value = UiHelperUtil.maskInput({
        value: this.inputElementRef.value.value,
        decimals: this.maxDecimals,
        integers: this.maxIntegers
      })

      this.dispatchEvent(
        new CustomEvent('inputChange', {
          detail: this.inputElementRef.value.value,
          bubbles: true,
          composed: true
        })
      )

      this.resizeInput()
    }
  }

  private resizeInput() {
    if (this.widthVariant === 'fit') {
      const inputElement = this.inputElementRef.value

      if (inputElement) {
        const mirror = inputElement.previousElementSibling as HTMLSpanElement | null

        if (mirror) {
          mirror.textContent = inputElement.value || '0'
          inputElement.style.width = `${mirror.offsetWidth}px`
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-amount': WuiInputAmount
  }
}
