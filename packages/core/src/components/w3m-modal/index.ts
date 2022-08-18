import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { animate } from 'motion'
import { subscribe } from 'valtio/vanilla'
import ModalCtrl from '../../controllers/ModalCtrl'
import { getShadowRootElement } from '../../utils/Helpers'
import { global } from '../../utils/Theme'
import '../w3m-modal-backcard'
import '../w3m-modal-router'
import styles from './styles'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false
  @property() private readonly classes = {
    'w3m-modal-overlay': true,
    'w3m-modal-open': false
  }

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = subscribe(ModalCtrl.state, () => {
      if (ModalCtrl.state.open) this.onOpenModalEvent()
      if (!ModalCtrl.state.open) this.onCloseModalEvent()
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  private get overlayEl() {
    return getShadowRootElement(this, '.w3m-modal-overlay')
  }

  private get containerEl() {
    return getShadowRootElement(this, '.w3m-modal-container')
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) ModalCtrl.closeModal()
  }

  private onOpenModalEvent() {
    this.open = true
    this.classes['w3m-modal-open'] = true
    animate(this.overlayEl, { opacity: [0, 1] }, { duration: 0.2 })
    animate(this.containerEl, { scale: [0.98, 1] }, { duration: 0.2 })
  }

  private async onCloseModalEvent() {
    await Promise.all([
      animate(this.containerEl, { scale: [1, 0.98] }, { duration: 0.2 }).finished,
      animate(this.overlayEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
    ])
    this.classes['w3m-modal-open'] = false
    this.open = false
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div
        class=${classMap(this.classes)}
        @click=${this.onCloseModal}
        role="alertdialog"
        aria-modal="true"
      >
        <div class="w3m-modal-container">
          ${this.open
            ? html`
                <w3m-modal-backcard></w3m-modal-backcard>
                <div class="w3m-modal-content">
                  <w3m-modal-router></w3m-modal-router>
                </div>
              `
            : null}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
