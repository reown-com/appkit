import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { NETWORK_POLYGON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles.css'

@customElement('w3m-network-image')
export class W3mNetworkImage extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public src = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-network-image">
        <img src=${this.src} />
        ${NETWORK_POLYGON}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-image': W3mNetworkImage
  }
}
