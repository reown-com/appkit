import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import '../../layout/wui-flex'
import '../wui-input-numeric'
import { ref } from 'lit/directives/ref.js'

const regex = {
  number: /^[0-9]+$/u
}

@customElement('wui-otp')
export class WuiOtp extends LitElement {
  public static styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex gap="s">
        <wui-flex gap="xxs">
          ${[0, 1, 2].map(
            index => html`
              <wui-input-numeric
                @input=${(e: InputEvent) => this.handleInput(e, index)}
                @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
                ${ref(el => this.registerInputRef(el as HTMLInputElement, index))}
              ></wui-input-numeric>
            `
          )}
        </wui-flex>
        <wui-flex gap="xxs">
          ${[3, 4, 5].map(
            index => html`
              <wui-input-numeric
                @input=${(e: InputEvent) => this.handleInput(e, index)}
                @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
                ${ref(el => this.registerInputRef(el as HTMLInputElement, index))}
              ></wui-input-numeric>
            `
          )}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private inputs: HTMLInputElement[] = []

  private validate = (character: string) => regex.number.test(character)

  private registerInputRef(el: HTMLInputElement, index: number) {
    setTimeout(() => {
      const inputElement = el.shadowRoot?.querySelector('input')
      if (inputElement instanceof HTMLInputElement) {
        this.inputs[index] = inputElement
      }
      this.inputs[0].focus()
    }, 1)
  }

  private focusInputField = (dir: 'next' | 'prev', index: number) => {
    if (dir === 'next') {
      const nextIndex = index + 1
      this.inputs[nextIndex < this.inputs.length ? nextIndex : index]?.focus()
    }
    if (dir === 'prev') {
      const nextIndex = index - 1
      this.inputs[nextIndex > -1 ? nextIndex : index]?.focus()
    }
  }

  private handleKeyDown = (e: KeyboardEvent, index: number) => {
    const inputElement = e.target as HTMLElement
    const shadowRoot = inputElement.shadowRoot

    if (shadowRoot) {
      const input = shadowRoot.querySelector('input')
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        this.focusInputField('prev', index)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        this.focusInputField('next', index)
      } else if (e.key === 'Delete') {
        e.preventDefault()
        if (input) {
          input.value = ''
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        if (input) {
          if (input.value === '') {
            this.focusInputField('prev', index)
          } else {
            input.value = ''
          }
        }
      }
    }
  }

  private handleInput(e: InputEvent, index: number) {
    const inputElement = e.target as HTMLElement
    const shadowRoot = inputElement.shadowRoot

    if (shadowRoot) {
      const input = shadowRoot.querySelector('input')
      const inputValue = input?.value ?? ''
      if (inputValue.length > 1 && input) {
        this.fillNext(input, inputValue, index)
      } else {
        const isValid = this.validate(inputValue)
        if (isValid) {
          this.focusInputField('next', index)
        } else if (input) {
          input.value = ''
        }
      }
    }
  }

  private fillNext(input: HTMLInputElement, inputValue: string, index: number) {
    const isValid = this.validate(inputValue[0])
    if (isValid) {
      input.value = inputValue[0]
      const inputString = inputValue.substring(1)
      if (index + 1 < this.inputs.length && inputString.length) {
        const nextInput = this.inputs[index + 1]
        this.fillNext(nextInput, inputString, index + 1)
      } else {
        this.focusInputField('next', index)
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-otp': WuiOtp
  }
}
