import { ModalController } from '@web3modal/core'
import '@web3modal/ui'
import { initializeTheming, setColorTheme } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [styles]

  @state() private open = ModalController.state.open

  public constructor() {
    super()
    initializeTheming()
    setColorTheme('dark')

    ModalController.subscribe('open', open => (this.open = open))
  }

  public render() {
    return this.open
      ? html`
          <wui-overlay @click=${ModalController.close}>
            <wui-card>Hello</wui-card>
          </wui-overlay>
        `
      : null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
