import { ModalCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getShadowRootElement } from '../../utils/Helpers'
import { CLOSE_ICON, NOISE_TEXTURE, WALLET_CONNECT_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import Whatamesh from '../../utils/Whatamesh'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends ThemedElement {
  public static styles = [global, styles]

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    const whatamesh = new Whatamesh()
    whatamesh.initGradient(this.canvasEl)
  }

  // -- private ------------------------------------------------------ //
  private get canvasEl() {
    return getShadowRootElement(this, '.w3m-gradient-canvas')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}
      <canvas class="w3m-gradient-canvas"></canvas>
      ${NOISE_TEXTURE}
      <div class="w3m-modal-highlight"></div>
      <div class="w3m-modal-toolbar">
        ${WALLET_CONNECT_LOGO}
        <button class="w3m-modal-close-btn" @click=${ModalCtrl.closeModal}>${CLOSE_ICON}</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-backcard': W3mModalBackcard
  }
}
