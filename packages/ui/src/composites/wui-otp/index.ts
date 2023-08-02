import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../layout/wui-flex/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtils.js'
import '../wui-input-numeric/index.js'
import { WuiInputNumeric } from '../wui-input-numeric/index.js'
import styles from './styles.js'

@customElement('wui-otp')
export class WuiOtp extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public length = 6

  private numerics: WuiInputNumeric[] = []

  public override firstUpdated() {
    const numericElements = this.shadowRoot?.querySelectorAll<WuiInputNumeric>('wui-input-numeric')
    if (numericElements) {
      this.numerics = Array.from(numericElements)
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex gap="xxs">
        ${[...Array(this.length)].map(
          (_, index: number) => html`
            <wui-input-numeric
              @input=${(e: InputEvent) => this.handleInput(e, index)}
              @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
            >
            </wui-input-numeric>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private handleInput(e: InputEvent, index: number) {
    const inputElement = e.target as HTMLElement
    const input = this.getInputElement(inputElement)

    if (input) {
      const inputValue = input.value
      if (e.inputType === 'insertFromPaste') {
        this.handlePaste(input, inputValue, index)
      } else {
        const isValid = UiHelperUtil.isNumber(inputValue)
        if (isValid && e.data) {
          input.value = e.data
          this.focusInputField('next', index)
        } else {
          input.value = ''
        }
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent, index: number) => {
    const inputElement = e.target as HTMLElement
    const input = this.getInputElement(inputElement)
    const keyArr = ['ArrowLeft', 'ArrowRight', 'Shift', 'Delete']

    if (!input) {
      return
    }

    if (keyArr.includes(e.key)) {
      e.preventDefault()
    }

    const currentCaretPos = input.selectionStart
    switch (e.key) {
      case 'ArrowLeft':
        if (currentCaretPos) {
          input.setSelectionRange(currentCaretPos + 1, currentCaretPos + 1)
        }
        this.focusInputField('prev', index)
        break
      case 'ArrowRight':
        this.focusInputField('next', index)
        break
      case 'Shift':
        this.focusInputField('next', index)
        break
      case 'Delete':
        if (input.value === '') {
          this.focusInputField('prev', index)
        } else {
          input.value = ''
        }
        break
      case 'Backspace':
        if (input.value === '') {
          this.focusInputField('prev', index)
        } else {
          input.value = ''
        }
        break
      default:
    }
  }

  private handlePaste(input: HTMLInputElement, inputValue: string, index: number) {
    const value = inputValue[0]
    const isValid = value && UiHelperUtil.isNumber(value)
    if (isValid) {
      input.value = value
      const inputString = inputValue.substring(1)
      if (index + 1 < this.length && inputString.length) {
        const nextNumeric = this.numerics[index + 1]
        const nextInput = nextNumeric ? this.getInputElement(nextNumeric) : undefined
        if (nextInput) {
          this.handlePaste(nextInput, inputString, index + 1)
        }
      } else {
        this.focusInputField('next', index)
      }
    } else {
      input.value = ''
    }
  }

  private focusInputField = (dir: 'next' | 'prev', index: number) => {
    if (dir === 'next') {
      const nextIndex = index + 1
      const numeric = this.numerics[nextIndex < this.length ? nextIndex : index]
      const input = numeric ? this.getInputElement(numeric) : undefined
      if (input) {
        input.focus()
      }
    }
    if (dir === 'prev') {
      const nextIndex = index - 1
      const numeric = this.numerics[nextIndex > -1 ? nextIndex : index]
      const input = numeric ? this.getInputElement(numeric) : undefined
      if (input) {
        input.focus()
      }
    }
  }

  private getInputElement(el: HTMLElement) {
    if (el.shadowRoot?.querySelector('input')) {
      return el.shadowRoot.querySelector('input')
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-otp': WuiOtp
  }
}
