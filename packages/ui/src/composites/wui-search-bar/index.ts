import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import '../../composites/wui-input-element'
import { resetStyles } from '../../utils/ThemeUtil'
import '../wui-input-text'
import type { WuiInputText } from '../wui-input-text'
import styles from './styles'

@customElement('wui-search-bar')
export class WuiSearchBar extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  public inputComponentRef = createRef<WuiInputText>()

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-input-text
      ${ref(this.inputComponentRef)}
      placeholder="Search wallet"
      icon="search"
      size="sm"
    >
      <wui-input-element @click=${this.clearValue} icon="close"></wui-input-element>
    </wui-input-text>`
  }

  // -- Private ------------------------------------------- //
  private clearValue() {
    const inputComponent = this.inputComponentRef.value
    const inputElement = inputComponent?.inputElementRef.value
    if (inputElement) {
      inputElement.value = ''
      inputElement.dispatchEvent(new Event('input'))
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-search-bar': WuiSearchBar
  }
}
