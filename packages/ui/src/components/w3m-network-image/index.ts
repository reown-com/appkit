import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/w3m-text'
import { scss } from '../../style/utils'
import { NETWORK_POLYGON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import styles from './styles.css'

@customElement('w3m-network-image')
export class W3mNetworkImage extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public name = ''
  @property() public src = ''

  protected dynamicStyles() {
    const { overlay } = color()

    return html` <style>
      .network-polygon-stroke {
        stroke: ${overlay.thin};
      }
    </style>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <div class="w3m-network-image">
        <img src=${this.src} alt=${this.name} />
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
