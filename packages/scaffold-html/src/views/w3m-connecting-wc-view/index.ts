import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  ModalController,
  SnackController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  // -- Members ------------------------------------------- //
  private usnubscribe: (() => void)[] = []

  private interval?: ReturnType<typeof setInterval> = undefined

  private lastRetry = Date.now()

  // -- State & Properties -------------------------------- //
  @state() private uri = ConnectionController.state.wcUri

  public constructor() {
    super()
    this.usnubscribe.push(ConnectionController.subscribeKey('wcUri', val => (this.uri = val)))
    this.initializeConnection()
    this.interval = setInterval(this.initializeConnection.bind(this), ConstantsUtil.TEN_SEC_MS)
  }

  public disconnectedCallback() {
    clearTimeout(this.interval)
    this.usnubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`<w3m-connecting-wc-qrcode uri=${ifDefined(this.uri)}></w3m-connecting-wc-qrcode>`
  }

  // -- Private ------------------------------------------- //
  private async initializeConnection(retry = false) {
    try {
      const { wcPairingExpiry } = ConnectionController.state
      if (retry || CoreHelperUtil.isPairingExpired(wcPairingExpiry)) {
        ConnectionController.connectWalletConnect()
        await ConnectionController.state.wcPromise
        ModalController.close()
      }
    } catch {
      if (CoreHelperUtil.isAllowedRetry(this.lastRetry)) {
        SnackController.showError('Declined')
        this.lastRetry = Date.now()
        this.initializeConnection(true)
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-view': W3mConnectingWcView
  }
}
