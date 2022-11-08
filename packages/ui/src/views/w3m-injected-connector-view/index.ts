import { ClientCtrl, ModalCtrl, OptionsCtrl } from '@web3modal/core'
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
import { scss } from '../../style/utils'
import { RETRY_ICON } from '../../utils/Svgs'
import { color, global } from '../../utils/Theme'
import { getOptimisticName } from '../../utils/UiHelpers'
import styles from './styles.css'

@customElement('w3m-injected-connector-view')
export class W3mInjectedConnectorView extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- state & properties ------------------------------------------- //
  @state() private connecting = true
  @state() private error = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.ethereum().getConnectorById('injected')

  private async onConnect() {
    try {
      const { ready } = this.connector
      if (ready) {
        this.error = false
        this.connecting = true
        await ClientCtrl.ethereum().connectInjected(OptionsCtrl.state.selectedChainId)
        ModalCtrl.close()
      }
    } catch (error: unknown) {
      this.error = true
      this.connecting = false
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const optimisticName = getOptimisticName(this.connector.name)
    const classes = {
      'w3m-injected-wrapper': true,
      'w3m-injected-error': this.error
    }

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>
      <w3m-modal-content>
        <div class=${classMap(classes)}>
          <w3m-wallet-image name=${optimisticName} size="lg"></w3m-wallet-image>
          <div class="w3m-connecting-title">
            ${this.connecting
              ? html`<w3m-spinner size="22" color=${color().foreground[2]}></w3m-spinner>`
              : null}
            <w3m-text variant="large-bold" color=${this.error ? 'error' : 'secondary'}>
              ${this.error ? 'Connection declined' : `Continue in ${optimisticName}...`}
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
    'w3m-injected-connector-view': W3mInjectedConnectorView
  }
}
