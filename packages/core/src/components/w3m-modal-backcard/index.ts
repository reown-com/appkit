import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import transparentNoise from '../../images/transparentNoise'
import walletConnectLogo from '../../images/walletConnectLogo'
import Whatamesh from '../../libs/Whatamesh'
import global from '../../theme/global'
import styles from './styles'

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends LitElement {
  public static styles = [global, styles]

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    const gradient = new Whatamesh()
    const canvas = this.renderRoot.querySelector('#w3m-gradient-canvas')
    gradient.initGradient(canvas)
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <canvas class="w3m-modal-media" id="w3m-gradient-canvas"></canvas>
      ${transparentNoise}
      <div class="w3m-modal-highlight"></div>
      <div class="w3m-modal-toolbar">${walletConnectLogo}</div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-backcard': W3mModalBackcard
  }
}
