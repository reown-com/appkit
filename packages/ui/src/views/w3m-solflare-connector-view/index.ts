import { ClientCtrl, ConnectModalCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'
import '../../components/w3m-spinner'
import '../../components/w3m-text'
import '../../components/w3m-wallet-image'
import { RETRY_ICON } from '../../utils/Svgs'
import { color, global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-solflare-connector-view')
export class W3mSolflareConnectorView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private connecting = true
  @state() private error = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private async onConnect() {
    try {
      const ready = ClientCtrl.solana().getConnectorIsAvailable('injected-window.solflare')
      if (ready) {
        this.error = false
        this.connecting = true
        await ClientCtrl.solana().connectInjected('window.solflare')
        ConnectModalCtrl.closeModal()
      }
    } catch (error: unknown) {
      this.error = true
      this.connecting = false
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const name = 'Solflare'
    const classes = {
      'w3m-injected-wrapper': true,
      'w3m-injected-error': this.error
    }

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      <w3m-modal-content>
        <div class=${classMap(classes)}>
          <w3m-wallet-image name=${name} size="lg"></w3m-wallet-image>
          <div class="w3m-connecting-title">
            ${this.connecting
              ? html`<w3m-spinner size="22" color=${color().foreground[2]}></w3m-spinner>`
              : null}
            <w3m-text variant="large-bold" color=${this.error ? 'error' : 'secondary'}>
              ${this.error ? 'Connection declined' : `Continue in ${name}...`}
            </w3m-text>
          </div>

          <w3m-button
            .onClick=${this.onConnect.bind(this)}
            .disabled=${!this.error}
            .iconRight=${RETRY_ICON}
          >
            Try Again
          </w3m-button>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-solflare-connector-view': W3mSolflareConnectorView
  }
}
