import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-input-text')
export class WuiInputText extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'lg' | 'xs' | 'xxs'> = 'md'

  @property() public icon?: IconType

  @property({ type: Boolean }) public disabled = false

  @property() public placeholder = ''

  public inputElementRef = createRef<HTMLInputElement>()

  // -- Render -------------------------------------------- //
  public render() {
    const sizeClass = `wui-size-${this.size}`

    return html` ${this.templateIcon()}
      <input
        ${ref(this.inputElementRef)}
        class=${sizeClass}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
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
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-text': WuiInputText
  }
}
