import { AccountCtrl, ClientCtrl, OptionsCtrl, ToastCtrl, WcConnectionCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

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
    this.unwatchAccount = AccountCtrl.subscribe(account => {
      if (this.isAccountConnected !== account.isConnected) {
        this.isAccountConnected = account.isConnected
        this.connectAndWait()
      }
    })
  }

  public disconnectedCallback() {
    this.unwatchOptions?.()
    this.unwatchAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchOptions?: () => void = undefined
  private readonly unwatchAccount?: () => void = undefined
  private timeout?: NodeJS.Timeout = undefined
  private selectedChainId?: number = OptionsCtrl.state.selectedChain?.id
  private isAccountConnected = AccountCtrl.state.isConnected

  private async connectAndWait() {
    clearTimeout(this.timeout)

    if (!this.isAccountConnected) {
      this.timeout = setTimeout(this.connectAndWait.bind(this), THREE_MIN_MS)
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
        this.connectAndWait()
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-connection-context': W3mWcConnectionContext
  }
}
