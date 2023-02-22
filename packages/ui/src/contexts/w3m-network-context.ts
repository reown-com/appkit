import { AccountCtrl, ClientCtrl, ConfigCtrl, OptionsCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { UiUtil } from '../utils/UiUtil'

@customElement('w3m-network-context')
export class W3mNetworkContext extends LitElement {
  @state() private activeChainId?: number = undefined

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Additional full modal features, not available in standalone
    const chain = OptionsCtrl.getSelectedChain()
    this.activeChainId = chain?.id

    // Subscribe network state
    this.unwatchNetwork = ClientCtrl.client().watchNetwork(network => {
      const newChain = network.chain
      if (newChain && this.activeChainId !== newChain.id) {
        OptionsCtrl.setSelectedChain(newChain)
        this.activeChainId = newChain.id
        AccountCtrl.resetBalance()
        this.fetchBalance()
      }
    })
  }

  public disconnectedCallback() {
    this.unwatchNetwork?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchNetwork?: () => void = undefined

  private async fetchBalance(balanceAddress?: `0x${string}`) {
    try {
      if (ConfigCtrl.state.enableAccountView) {
        AccountCtrl.setBalanceLoading(true)
        const address = balanceAddress ?? AccountCtrl.state.address
        if (address) {
          const balance = await ClientCtrl.client().fetchBalance({ address })
          AccountCtrl.setBalance({ amount: balance.formatted, symbol: balance.symbol })
        }
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
    } finally {
      AccountCtrl.setBalanceLoading(false)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-context': W3mNetworkContext
  }
}
