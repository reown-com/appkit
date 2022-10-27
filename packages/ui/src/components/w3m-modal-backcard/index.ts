import { ModalCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { CROSS_ICON, NOISE_TEXTURE, WALLET_CONNECT_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { getShadowRootElement } from '../../utils/UiHelpers'
import Whatamesh from '../../utils/Whatamesh'
import styles, { dynamicStyles } from './styles'

const whatamesh = new Whatamesh()

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    setTimeout(() => {
      whatamesh.play(this.canvasEl)
      this.open = true
    }, 1000)
  }

  public disconnectedCallback() {
    whatamesh.stop()
  }

  // -- private ------------------------------------------------------ //
  private get canvasEl() {
    return getShadowRootElement(this, '.w3m-gradient-canvas')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-gradient-canvas': true,
      'w3m-gradient-canvas-visible': this.open
    }

    return html`
      ${dynamicStyles()}

      <div class="w3m-gradient-placeholder"></div>
      <canvas class=${classMap(classes)}></canvas>
      ${NOISE_TEXTURE}
      <div class="w3m-modal-highlight"></div>
      <div class="w3m-modal-toolbar">
        ${WALLET_CONNECT_LOGO}
        <button class="w3m-modal-close-btn" @click=${ModalCtrl.close}>${CROSS_ICON}</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-backcard': W3mModalBackcard
  }
}
