import { AccountCtrl, ClientCtrl, OptionsCtrl, ToastCtrl, WcConnectionCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

// -- constants ---------------------------------------------------- //
const FOUR_MIN_MS = 240_000
const ONE_SEC_MS = 1_000

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
    this.unwatchWcConnection = WcConnectionCtrl.subscribe(wcConnection => {
      if (wcConnection.pairingEnabled && !this.isGenerated) {
        this.connectAndWait()
      }
    })
  }

  public disconnectedCallback() {
    this.unwatchOptions?.()
    this.unwatchAccount?.()
    this.unwatchWcConnection?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchOptions?: () => void = undefined

  private readonly unwatchAccount?: () => void = undefined

  private readonly unwatchWcConnection?: () => void = undefined

  private timeout?: NodeJS.Timeout = undefined

  private isGenerated = false

  private selectedChainId = OptionsCtrl.state.selectedChain?.id

  private isAccountConnected = AccountCtrl.state.isConnected

  private lastRetry = Date.now()

  private async connectAndWait() {
    const { pairingEnabled } = WcConnectionCtrl.state
    clearTimeout(this.timeout)

    if (!this.isAccountConnected && pairingEnabled) {
      this.isGenerated = true
      this.timeout = setTimeout(this.connectAndWait.bind(this), FOUR_MIN_MS)
      try {
        const { selectedChain } = OptionsCtrl.state
        await ClientCtrl.client().connectWalletConnect(
          uri => WcConnectionCtrl.setPairingUri(uri),
          selectedChain?.id
        )
      } catch (err) {
        console.error(err)
        WcConnectionCtrl.setPairingError(true)
        ToastCtrl.openToast('Connection request declined', 'error')
        if (Date.now() - this.lastRetry >= ONE_SEC_MS) {
          this.lastRetry = Date.now()
          this.connectAndWait()
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wc-connection-context': W3mWcConnectionContext
  }
}
