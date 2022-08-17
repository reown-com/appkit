import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { animate } from 'motion'
import { subscribe } from 'valtio/vanilla'
import ModalCtrl from '../../controllers/ModalCtrl'
import global from '../../theme/global'
import '../w3m-modal-backcard'
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
    const el = this.renderRoot.querySelector('.w3m-modal-overlay')
    if (!el) throw new Error('.w3m-modal-overlay not found')

    return el
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) ModalCtrl.closeModal()
  }

  private onOpenModalEvent() {
    this.open = true
    this.classes['w3m-modal-open'] = true
    animate(this.overlayEl, { opacity: 1 })
  }

  private async onCloseModalEvent() {
    await animate(this.overlayEl, { opacity: 0 }).finished
    this.classes['w3m-modal-open'] = false
    this.open = false
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class=${classMap(this.classes)} @click=${this.onCloseModal}>
        ${this.open
          ? html`
              <div class="w3m-modal-container">
                <w3m-modal-backcard></w3m-modal-backcard>
                <div class="w3m-modal-content">Content</div>
              </div>
            `
          : null}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
