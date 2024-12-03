import { html, LitElement } from 'lit'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import '../../composites/wui-checkbox/index.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { CheckboxSize } from '../../utils/TypeUtil.js'

// -- Constants ------------------------------------------ //

const ICON_SIZE = {
  lg: 'sm',
  md: 'xs',
  sm: 'xxs'
}

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
