import { ClientCtrl, OptionsCtrl, ToastCtrl, WcConnectionCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

// TODO: need to react to chain changes and update pairing uri

// -- constants ---------------------------------------------------- //
const THREE_MIN_MS = 180_000

@customElement('w3m-wc-connection-context')
export class W3mWcConnectionContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.connectAndWait()
    this.unwatchOptions = OptionsCtrl.subscribe(options => {
      if (options.selectedChain?.id !== this.selectedChainId) {
        this.selectedChainId = options.selectedChain?.id
        this.connectAndWait()
      }
    })
  }

  public disconnectedCallback() {
    this.unwatchOptions?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchOptions?: () => void = undefined
  private timeout?: NodeJS.Timeout = undefined
  private selectedChainId?: number = undefined

  private async connectAndWait(retry = 0) {
    console.log('Connect and wait')
    clearTimeout(this.timeout)
    this.timeout = setTimeout(this.connectAndWait, THREE_MIN_MS)
    try {
      const { standaloneUri, selectedChain } = OptionsCtrl.state
      if (standaloneUri) {
        WcConnectionCtrl.setPairingUri(standaloneUri)
      } else {
        await ClientCtrl.client().connectWalletConnect(
          uri => WcConnectionCtrl.setPairingUri(uri),
          selectedChain?.id
        )
      }
    } catch (err) {
      console.error(err)
      WcConnectionCtrl.setPairingError(true)
      ToastCtrl.openToast('Connection request declined', 'error')
      if (retry < 2) {
        this.connectAndWait(retry + 1)
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-connection-context': W3mWcConnectionContext
  }
}
