import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-injected-connector-view')
export class W3mInjectedConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private connecting = true
  @state() private error = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.client().getConnectorById('injected')

  private async onConnect() {
    try {
      const { ready } = this.connector
      if (ready) {
        this.error = false
        this.connecting = true
        await UiUtil.handleCustomConnector('injected')
      }
    } catch (error: unknown) {
      this.error = true
      this.connecting = false
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const optimisticName = UiUtil.getWalletName(this.connector.name)
    const optimisticWalletId = UiUtil.getWalletId(this.connector.id)
    const classes = {
      'w3m-injected-wrapper': true,
      'w3m-injected-error': this.error
    }

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>
      <w3m-modal-content>
        <div class=${classMap(classes)}>
          <w3m-wallet-image walletId=${optimisticWalletId} size="lg"></w3m-wallet-image>
          <div class="w3m-connecting-title">
            ${this.connecting ? html`<w3m-spinner></w3m-spinner>` : null}
            <w3m-text variant="large-bold" color=${this.error ? 'error' : 'secondary'}>
              ${this.error ? 'Connection declined' : `Continue in ${optimisticName}...`}
            </w3m-text>
          </div>

          <w3m-button
            .onClick=${this.onConnect.bind(this)}
            .disabled=${!this.error}
            .iconRight=${SvgUtil.RETRY_ICON}
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
