import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { CheckboxSize, IconSizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import './index.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const ICON_SIZE = {
  lg: 'md',
  md: 'sm',
  sm: 'sm'
} as Record<CheckboxSize, IconSizeType>

@customElement('wui-checkbox')
export class WuiCheckBox extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public checked?: boolean = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public size: CheckboxSize = 'md'

  // -- Render -------------------------------------------- //
  public override render() {
    const iconSize = ICON_SIZE[this.size]

    return html`
      <label data-size=${this.size}>
        <input
          ${ref(this.inputElementRef)}
          ?checked=${ifDefined(this.checked)}
          ?disabled=${this.disabled}
          type="checkbox"
          @change=${this.dispatchChangeEvent}
        />
        <span>
          <wui-icon name="checkmarkBold" size=${iconSize}></wui-icon>
        </span>
        <slot></slot>
      </label>
    `
  }

  // -- Private ------------------------------------------- //

  private dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('checkboxChange', {
        detail: this.inputElementRef.value?.checked,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-checkbox': WuiCheckBox
  }
}
