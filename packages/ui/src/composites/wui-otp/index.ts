import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import '../../layout/wui-flex'
import '../wui-input-numeric'
import { UiHelperUtil } from '../../utils/UiHelperUtils'
import { WuiInputNumeric } from '../wui-input-numeric'

@customElement('wui-otp')
export class WuiOtp extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public length = 6

  private numerics: WuiInputNumeric[] = []

  firstUpdated() {
    const shadowRoot = this.shadowRoot
    if (shadowRoot) {
      this.numerics = [...shadowRoot.querySelectorAll<WuiInputNumeric>('wui-input-numeric')]
    }
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex gap="s">
        <wui-flex gap="xxs">
          ${[...Array(this.length)].map(
            (_: undefined, index: number) => html`
              <wui-input-numeric
                @input=${(e: InputEvent) => this.handleInput(e, index)}
                @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
              >
              </wui-input-numeric>
            `
          )}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private focusInputField = (dir: 'next' | 'prev', index: number) => {
    if (dir === 'next') {
      const nextIndex = index + 1
      const numeric = this.numerics[nextIndex < this.length ? nextIndex : index]
      const input = this.getInputElement(numeric)
      if (input) {
        input.focus()
      }
    }
    if (dir === 'prev') {
      const nextIndex = index - 1
      const numeric = this.numerics[nextIndex > -1 ? nextIndex : index]
      const input = this.getInputElement(numeric)
      if (input) {
        input.focus()
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent, index: number) => {
    const inputElement = e.target as HTMLElement
    const input = this.getInputElement(inputElement)

    if (!input) {
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
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

  private getInputElement(el: HTMLElement) {
    if (el.shadowRoot) {
      const shadowRoot = el.shadowRoot
      if (shadowRoot.querySelector('input')) {
        return shadowRoot.querySelector('input')
      }
    }

    return null
  }

  private handleInput(e: InputEvent, index: number) {
    const inputElement = e.target as HTMLElement
    const input = this.getInputElement(inputElement)

    if (input) {
      const inputValue = input.value
      if (e.inputType === 'insertFromPaste') {
        this.fillNext(input, inputValue, index)
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

  private fillNext(input: HTMLInputElement, inputValue: string, index: number) {
    const isValid = UiHelperUtil.isNumber(inputValue[0])
    if (isValid) {
      input.value = inputValue[0]
      const inputString = inputValue.substring(1)
      if (index + 1 < this.length && inputString.length) {
        const nextNumeric = this.numerics[index + 1]
        const nextInput = this.getInputElement(nextNumeric)
        if (nextInput) {
          this.fillNext(nextInput, inputString, index + 1)
        }
      } else {
        this.focusInputField('next', index)
      }
    } else {
      input.value = ''
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-otp': WuiOtp
  }
}
