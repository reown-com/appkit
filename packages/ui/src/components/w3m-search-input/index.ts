import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SEARCH_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import '../w3m-text'
import styles from './styles.css'

@customElement('w3m-search-input')
export class W3mSearchInput extends LitElement {
  public static styles = [global, styles]

  @property() public onChange = () => null

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <input type="text" @input=${this.onChange} placeholder="Search" />
      <div class="w3m-placeholder">
        ${SEARCH_ICON}
        <w3m-text color="secondary" variant="medium-thin">Search</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-search-input': W3mSearchInput
  }
}
