import { AccountCtrl, ClientCtrl, OptionsCtrl, ToastCtrl, WcConnectionCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

// -- constants ---------------------------------------------------- //
const THREE_MIN_MS = 180_000
const FIVE_SEC_MS = 5_000

@customElement('w3m-wc-connection-context')
export class W3mWcConnectionContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unwatchOptions = OptionsCtrl.subscribe(options => {
      if (options.selectedChain?.id !== this.selectedChainId) {
        this.selectedChainId = options.selectedChain?.id
        this.connectAndWait()
      }
    })
    this.unwatchAccount = AccountCtrl.subscribe(account => {
      if (this.isAccountConnected !== account.isConnected || !this.isGenerated) {
        this.isAccountConnected = account.isConnected
        this.connectAndWait()
      }
    })
    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this))
  }

  public disconnectedCallback() {
    this.unwatchOptions?.()
    this.unwatchAccount?.()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchOptions?: () => void = undefined
  private readonly unwatchAccount?: () => void = undefined
  private timeout?: NodeJS.Timeout = undefined
  private isGenerated = false
  private selectedChainId?: number = OptionsCtrl.state.selectedChain?.id
  private isAccountConnected = AccountCtrl.state.isConnected
  private lastVisible = Date.now()

  private async connectAndWait() {
    clearTimeout(this.timeout)

    if (!this.isAccountConnected) {
      this.timeout = setTimeout(this.connectAndWait.bind(this), THREE_MIN_MS)
      try {
        const { standaloneUri, selectedChain } = OptionsCtrl.state
        if (standaloneUri) {
          WcConnectionCtrl.setPairingUri(standaloneUri)
        } else {
          this.isGenerated = true
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

  private onVisibilityChange() {
    if (document.hidden) {
      this.lastVisible = Date.now()
    } else if (Date.now() - this.lastVisible > FIVE_SEC_MS) {
      this.connectAndWait()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-connection-context': W3mWcConnectionContext
  }
}
