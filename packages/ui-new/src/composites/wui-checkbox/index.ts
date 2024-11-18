import { html, LitElement } from 'lit'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { resetStyles } from '../../utils/ThemeUtil.js'

@customElement('wui-checkbox')
export class WuiCheckBox extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public checked?: boolean = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <label>
        <input
          ${ref(this.inputElementRef)}
          ?checked=${ifDefined(this.checked)}
          type="checkbox"
          @change=${this.dispatchChangeEvent}
        />
        <span>
          <wui-icon name="checkmarkBold" color="inverse-100" size="xxs"></wui-icon>
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
