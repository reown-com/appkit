import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { subscribe } from 'valtio'
import ModalCtrl from '../../controllers/ModalCtrl'
import transparentNoise from '../../images/transparentNoise'
import walletConnectLogo from '../../images/walletConnectLogo'
import Whatamesh from '../../libs/Whatamesh'
import global from '../../theme/global'
import styles from './styles'

/**
 * Component
 */
@customElement('w3m-modal-container')
export class W3mModalContainer extends LitElement {
  public static styles = [global, styles]
  private readonly unsubscribe: (() => void) | null = null

  @state() private open = false
  @property() private readonly classes = {
    'w3m-modal-overlay': true,
    'w3m-modal-open': false
  }

  public constructor() {
    super()
    this.unsubscribe = subscribe(ModalCtrl.state, () => {
      this.open = ModalCtrl.state.open
      this.classes['w3m-modal-open'] = this.open
      if (this.open) {
        this.onOpenModal()
      }
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  private onOpenModal() {
    const gradient = new Whatamesh()
    const canvas = this.renderRoot.querySelector('#w3m-gradient-canvas')
    gradient.initGradient(canvas)
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalCtrl.closeModal()
    }
  }

  protected render() {
    return html`
      <div class=${classMap(this.classes)} @click=${this.onCloseModal}>
        ${this.open
          ? html`
              <div class="w3m-modal-container">
                <canvas class="w3m-modal-media" id="w3m-gradient-canvas"></canvas>
                ${transparentNoise}
                <div class="w3m-modal-highlight"></div>
                <div class="w3m-modal-toolbar">${walletConnectLogo}</div>
                <div class="w3m-modal-content">Content</div>
              </div>
            `
          : null}
      </div>
    `
  }
}

/**
 * Types
 */
declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-container': W3mModalContainer
  }
}
