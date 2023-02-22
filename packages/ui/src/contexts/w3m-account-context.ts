import { ClientCtrl, ConfigCtrl, OptionsCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { UiUtil } from '../utils/UiUtil'

@customElement('w3m-account-context')
export class W3mAccountContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Set & Subscribe to account, ens state
    OptionsCtrl.getAccount()
    this.fetchEnsProfile()
    this.fetchBalance()
    this.unwatchAccount = ClientCtrl.client().watchAccount(account => {
      const { address } = OptionsCtrl.state
      if (account.address !== address) {
        this.fetchEnsProfile(account.address)
        this.fetchBalance(account.address)
      }
      OptionsCtrl.setAddress(account.address)
      OptionsCtrl.setIsConnected(account.isConnected)
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
        OptionsCtrl.setProfileLoading(true)
        const address = profileAddress ?? OptionsCtrl.state.address
        const { id } = ClientCtrl.client().getDefaultChain()
        if (address && id === 1) {
          const [name, avatar] = await Promise.all([
            ClientCtrl.client().fetchEnsName({ address, chainId: 1 }),
            ClientCtrl.client().fetchEnsAvatar({ address, chainId: 1 })
          ])
          if (avatar) {
            await UiUtil.preloadImage(avatar)
          }
          OptionsCtrl.setProfileName(name)
          OptionsCtrl.setProfileAvatar(avatar)
        }
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
    } finally {
      OptionsCtrl.setProfileLoading(false)
    }
  }

  private async fetchBalance(balanceAddress?: `0x${string}`) {
    try {
      if (ConfigCtrl.state.enableAccountView) {
        OptionsCtrl.setBalanceLoading(true)
        const address = balanceAddress ?? OptionsCtrl.state.address
        if (address) {
          const balance = await ClientCtrl.client().fetchBalance({ address })
          OptionsCtrl.setBalance({ amount: balance.formatted, symbol: balance.symbol })
        }
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
    } finally {
      OptionsCtrl.setBalanceLoading(false)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-context': W3mAccountContext
  }
}
