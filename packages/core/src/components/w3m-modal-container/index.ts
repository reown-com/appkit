import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { subscribe } from 'valtio/vanilla'
import ModalCtrl from '../../controllers/ModalCtrl'
import global from '../../theme/global'
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
      this.open = ModalCtrl.state.open
      this.classes['w3m-modal-open'] = this.open
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalCtrl.closeModal()
    }
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
