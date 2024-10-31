import { html, LitElement } from 'lit'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import styles from './styles.js'

@customElement('wui-checkbox')
export class WuiCheckBox extends LitElement {
  static override styles = [styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <label>
        <input ${ref(this.inputElementRef)} type="checkbox" @change=${this.dispatchChangeEvent} />
        <span>
          <wui-icon name="checkmark" color="inverse-100" size="xxs"></wui-icon>
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
