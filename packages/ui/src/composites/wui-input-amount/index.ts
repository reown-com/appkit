import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { createRef, ref } from 'lit/directives/ref.js'

@customElement('wui-input-amount')
export class WuiInputAmount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property({ type: String }) public value = ''

  @property({ type: String }) public placeholder = '0'

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.inputElementRef?.value && this.value) {
      this.inputElementRef.value.value = this.value
    }

    return html`<input
      ${ref(this.inputElementRef)}
      type="text"
      inputmode="numeric"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value ?? ''}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    /> `
  }

  // -- Private ------------------------------------------- //
  private dispatchInputChangeEvent(e: InputEvent) {
    const regex = /[0-9,.]/u
    const inputChar = e.data
    if (inputChar) {
      if (!regex.test(inputChar) && this.inputElementRef?.value) {
        this.inputElementRef.value.value = this.value.replace(
          new RegExp(inputChar.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'gu'),
          ''
        )
      }
    }
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
    'wui-input-amount': WuiInputAmount
  }
}
