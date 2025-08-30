import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, InputType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-input-text')
export class WuiInputText extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //

  @property() public icon?: IconType

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public loading = false

  @property() public placeholder = ''

  @property() public type: InputType = 'text'

  @property() public value?: string = ''

  @property() public errorText?: string

  @property() public warningText?: string

  @property() public onSubmit?: () => void

  @property() public size: 'md' | 'lg' = 'md'

  @property({ attribute: false }) public onKeyDown?: (event: KeyboardEvent) => void

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${ref(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${ifDefined(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value || ''}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`
  }

  // -- Private ------------------------------------------- //
  private templateLeftIcon() {
    if (this.icon) {
      return html`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`
    }

    return null
  }

  private templateSubmitButton() {
    if (this.onSubmit) {
      return html`<button
        class="wui-input-text-submit-button ${this.loading ? 'loading' : ''}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled || this.loading}
      >
        ${this.loading
          ? html`<wui-icon name="spinner" size="md"></wui-icon>`
          : html`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`
    }

    return null
  }

  private templateError() {
    if (this.errorText) {
      return html`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`
    }

    return null
  }

  private templateWarning() {
    if (this.warningText) {
      return html`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`
    }

    return null
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
    'wui-input-text': WuiInputText
  }
}
