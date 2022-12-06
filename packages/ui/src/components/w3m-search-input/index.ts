import { CoreUtil } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-search-input')
export class W3mSearchInput extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  @property() public onChange = () => null

  // -- render ------------------------------------------------------- //
  protected render() {
    const placeholder = CoreUtil.isMobile() ? 'Search mobile wallets' : 'Search desktop wallets'

    return html`
      <input type="text" @input=${this.onChange} placeholder=${placeholder} />
      <div class="w3m-placeholder">
        ${SvgUtil.SEARCH_ICON}
        <w3m-text color="secondary" variant="medium-thin">${placeholder}</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-search-input': W3mSearchInput
  }
}
