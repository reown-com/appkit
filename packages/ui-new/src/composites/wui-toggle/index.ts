import { html, LitElement } from 'lit'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { ToggleSize } from '../../utils/TypeUtil.js'

@customElement('wui-toggle')
export class WuiToggle extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public checked?: boolean = undefined

  @property({ type: Boolean }) public disabled = false

  @property() public size: ToggleSize = 'md'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <label data-size=${this.size}>
        <input
          ${ref(this.inputElementRef)}
          type="checkbox"
          ?checked=${ifDefined(this.checked)}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `
  }

  // -- Private ------------------------------------------- //
  private dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('switchChange', {
        detail: this.inputElementRef.value?.checked,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-toggle': WuiToggle
  }
}
