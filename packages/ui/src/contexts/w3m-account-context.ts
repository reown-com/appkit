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
    this.fetchProfile()
    this.fetchBalance()
    this.unwatchAccount = ClientCtrl.client().watchAccount(account => {
      const { address } = AccountCtrl.state
      if (account.address !== address) {
        this.fetchProfile(account.address)
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

  private async fetchProfile(profileAddress?: `0x${string}`) {
    if (ConfigCtrl.state.enableAccountView) {
      try {
        await AccountCtrl.fetchProfile(UiUtil.preloadImage, profileAddress)
      } catch (err) {
        console.error(err)
        ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      }
    }
  }

  private async fetchBalance(balanceAddress?: `0x${string}`) {
    if (ConfigCtrl.state.enableAccountView) {
      try {
        await AccountCtrl.fetchBalance(balanceAddress)
      } catch (err) {
        console.error(err)
        ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-context': W3mAccountContext
  }
}
