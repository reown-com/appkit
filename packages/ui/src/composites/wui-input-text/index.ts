import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, InputType, SizeType } from '../../utils/TypesUtil.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('wui-input-text')
export class WuiInputText extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property() public icon?: IconType

  @property({ type: Boolean }) public disabled = false

  @property() public placeholder = ''

  @property() public type: InputType = 'text'

  @property() public keyHint?: HTMLInputElement['enterKeyHint']

  public inputElementRef = createRef<HTMLInputElement>()

  // -- Render -------------------------------------------- //
  public override render() {
    const sizeClass = `wui-size-${this.size}`

    return html` ${this.templateIcon()}
      <input
        ${ref(this.inputElementRef)}
        class=${sizeClass}
        type=${this.type}
        enterkeyhint=${ifDefined(this.enterKeyHint)}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        @input=${this.dispatchInputChangeEvent.bind(this)}
      />
      <slot></slot>`
  }

  // -- Private ------------------------------------------- //
  private templateIcon() {
    if (this.icon) {
      return html`<wui-icon
        data-input=${this.size}
        size="md"
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
