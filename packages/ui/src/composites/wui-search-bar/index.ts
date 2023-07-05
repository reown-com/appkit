import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { globalStyles } from '../../utils/ThemeUtil'
import '../../composites/wui-input-element'
import '../../composites/wui-input'
import { searchSvg } from '../../assets/svg/search'
import { closeSvg } from '../../assets/svg/close'
import styles from './styles'

@customElement('wui-search-bar')
export class WuiSearchBar extends LitElement {
  public static styles = [globalStyles, styles]

  // -- state & properties ------------------------------------------- //

  // -- render ------------------------------------------------------- //
  public render() {
    return html`<wui-input placeholder="Search wallet" .icon=${searchSvg} size="sm"
      ><wui-input-element .icon=${closeSvg}></wui-input-element
    ></wui-input>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-search-bar': WuiSearchBar
  }
}
