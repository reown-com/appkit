import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { SEARCH_ICON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import '../w3m-text'
import styles from './styles.scss'

@customElement('w3m-search-input')
export class W3mSearchInput extends LitElement {
  public static styles = [global, scss`${styles}`]

  @property() public onChange = () => null

  protected dynamicStyles() {
    const { background, overlay, foreground } = color()

    return html`<style>
      input {
        background-color: ${background[3]};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }

      input:focus-within,
      input:not(:placeholder-shown) {
        color: ${foreground[1]};
      }

      input:focus-within {
        box-shadow: inset 0 0 0 1px ${foreground.accent};
      }

      path {
        fill: ${foreground[2]};
      }
    </style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

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
