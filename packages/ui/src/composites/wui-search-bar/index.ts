import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import '../../composites/wui-input-element'
import { ref, createRef } from 'lit/directives/ref.js'
import '../../composites/wui-input'
import styles from './styles'
import type { WuiInput } from '../../composites/wui-input'

@customElement('wui-search-bar')
export class WuiSearchBar extends LitElement {
  public static styles = [resetStyles, styles]

  // -- state & properties ------------------------------------------- //

  public inputComponentRef = createRef<WuiInput>()

  // -- render ------------------------------------------------------- //

  public render() {
    return html` <wui-input
      ${ref(this.inputComponentRef)}
      placeholder="Search wallet"
      icon="search"
      size="sm"
    >
      <wui-input-element @click=${this.clearValue} icon="close"></wui-input-element>
    </wui-input>`
  }

  // -- private ------------------------------------------------------ //

  private clearValue() {
    const inputComponent = this.inputComponentRef.value
    const inputElement = inputComponent?.inputElementRef.value
    if (inputElement) {
      inputElement.value = ''
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-search-bar': WuiSearchBar
  }
}
