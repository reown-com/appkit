import { ModalController } from '@web3modal/core'
import { initializeTheming, setColorTheme } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [styles]

  // -- State & Properties -------------------------------- //
  @state() private open = ModalController.state.open

  public constructor() {
    super()
    initializeTheming()
    setColorTheme('dark')
    ModalController.subscribe('open', open => (this.open = open))
  }

  // -- Render -------------------------------------------- //
  public render() {
    return this.open
      ? html`
          <wui-overlay @click=${this.onClose.bind(this)}>
            <wui-card>
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
            </wui-card>
          </wui-overlay>
        `
      : null
  }

  // -- Private ------------------------------------------- //
  private onClose(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalController.close()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
