import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-input-text/index.js'
import type { WuiInputText } from '../wui-input-text/index.js'
import styles from './styles.js'

@customElement('wui-search-bar')
export class WuiSearchBar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  public inputComponentRef: Ref<WuiInputText> = createRef<WuiInputText>()

  @property() public inputValue = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-input-text
        ${ref(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue
          ? html`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`
          : null}
      </wui-input-text>
    `
  }

  // -- Private ------------------------------------------- //
  private onInputChange(event: CustomEvent) {
    this.inputValue = event.detail || ''
  }

  private clearValue() {
    const component = this.inputComponentRef.value
    const inputElement = component?.inputElementRef.value
    if (inputElement) {
      inputElement.value = ''
      this.inputValue = ''
      inputElement.focus()
      inputElement.dispatchEvent(new Event('input'))
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-search-bar': WuiSearchBar
  }
}
