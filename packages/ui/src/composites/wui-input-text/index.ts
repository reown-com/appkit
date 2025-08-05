import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, InputType, SizeType, SpacingType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-input-text')
export class WuiInputText extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xs' | 'xxs'> = 'md'

  @property() public icon?: IconType

  @property({ type: Boolean }) public disabled = false

  @property() public placeholder = ''

  @property() public type: InputType = 'text'

  @property() public keyHint?: HTMLInputElement['enterKeyHint']

  @property() public value?: string = ''

  @property() public inputRightPadding?: SpacingType

  @property() public tabIdx?: number

  @property({ attribute: false }) public onKeyDown?: (event: KeyboardEvent) => void

  // -- Render -------------------------------------------- //
  public override render() {
    const inputClass = `wui-padding-right-${this.inputRightPadding}`
    const sizeClass = `wui-size-${this.size}`
    const classes = {
      [sizeClass]: true,
      [inputClass]: Boolean(this.inputRightPadding)
    }

    return html`${this.templateIcon()}
      <input
        data-testid="wui-input-text"
        ${ref(this.inputElementRef)}
        class=${classMap(classes)}
        type=${this.type}
        enterkeyhint=${ifDefined(this.enterKeyHint)}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        @input=${this.dispatchInputChangeEvent.bind(this)}
        @keydown=${this.onKeyDown}
        .value=${this.value || ''}
        tabindex=${ifDefined(this.tabIdx)}
      />
      <slot></slot>`
  }

  // -- Private ------------------------------------------- //
  private templateIcon() {
    if (this.icon) {
      return html`<wui-icon
        data-input=${this.size}
        size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`
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
