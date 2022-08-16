import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { subscribe } from 'valtio/vanilla'
import ModalCtrl from '../../controllers/ModalCtrl'
import global from '../../theme/global'
import { MODAL_FADE_IN, MODAL_FADE_OUT } from '../../theme/keyframes'
import '../w3m-modal-backcard'
import styles from './styles'

@customElement('w3m-modal-container')
export class W3mModalContainer extends LitElement {
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
    return this.renderRoot.querySelector('.w3m-modal-overlay')
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) ModalCtrl.closeModal()
  }

  private onOpenModalEvent() {
    this.open = true
    this.classes['w3m-modal-open'] = true
    this.overlayEl?.animate(MODAL_FADE_IN.keys, MODAL_FADE_IN.opts)
  }

  private async onCloseModalEvent() {
    await this.overlayEl?.animate(MODAL_FADE_OUT.keys, MODAL_FADE_OUT.opts).finished
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
    'w3m-modal-container': W3mModalContainer
  }
}
