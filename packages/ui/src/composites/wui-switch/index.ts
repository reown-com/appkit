import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-switch')
export class WuiSwitch extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

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
          type="checkbox"
          ?checked=${ifDefined(this.checked)}
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
    'wui-switch': WuiSwitch
  }
}
