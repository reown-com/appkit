import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../composites/wui-input-element'
import '../../composites/wui-input'
import { searchSvg } from '../../assets/svg/search'
import { closeSvg } from '../../assets/svg/close'
import styles from './styles'

@customElement('wui-search-bar')
export class WuiSearchBar extends LitElement {
  public static styles = [globalStyles, styles]

  // -- render ------------------------------------------------------- //
  public render() {
    return html`<wui-input placeholder="Search wallet" .icon=${searchSvg} size="sm"
      ><wui-input-element @click=${this.clearValue} .icon=${closeSvg}></wui-input-element
    ></wui-input>`
  }

  private clearValue() {
    const wuiInput = this.shadowRoot?.querySelector('wui-input')
    const inputElement = wuiInput?.shadowRoot?.querySelector('input')

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
