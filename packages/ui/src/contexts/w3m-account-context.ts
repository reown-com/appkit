import { AccountCtrl, ClientCtrl, ConfigCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { UiUtil } from '../utils/UiUtil'

@customElement('w3m-account-context')
export class W3mAccountContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Set & Subscribe to account, ens state
    AccountCtrl.getAccount()
    this.fetchEnsProfile()
    this.fetchBalance()
    this.unwatchAccount = ClientCtrl.client().watchAccount(account => {
      const { address } = AccountCtrl.state
      if (account.address !== address) {
        this.fetchEnsProfile(account.address)
        this.fetchBalance(account.address)
      }
      AccountCtrl.setAddress(account.address)
      AccountCtrl.setIsConnected(account.isConnected)
    })
  }

  public disconnectedCallback() {
    this.unwatchAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchAccount?: () => void = undefined

  private async fetchEnsProfile(profileAddress?: `0x${string}`) {
    try {
      if (ConfigCtrl.state.enableAccountView) {
        AccountCtrl.setProfileLoading(true)
        const address = profileAddress ?? AccountCtrl.state.address
        const { id } = ClientCtrl.client().getDefaultChain()
        if (address && id === 1) {
          const [name, avatar] = await Promise.all([
            ClientCtrl.client().fetchEnsName({ address, chainId: 1 }),
            ClientCtrl.client().fetchEnsAvatar({ address, chainId: 1 })
          ])
          if (avatar) {
            await UiUtil.preloadImage(avatar)
          }
          AccountCtrl.setProfileName(name)
          AccountCtrl.setProfileAvatar(avatar)
        }
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
    } finally {
      AccountCtrl.setProfileLoading(false)
    }
  }

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
    'w3m-account-context': W3mAccountContext
  }
}
