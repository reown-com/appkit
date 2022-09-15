import { AccountCtrl, ClientCtrl } from '@web3modal/core'
import type { GetBalanceOpts } from '@web3modal/ethereum'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-qrcode'
import '../../components/w3m-spinner'
import '../../components/w3m-text'
import '../../components/w3m-wallet-image'
import { ETH_IMG_ACCOUNT } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address = ''
  @state() private balance = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getAccounts()
    this.getBalance()
  }

  // -- private ------------------------------------------------------ //
  private getAccounts() {
    try {
      this.address = AccountCtrl.state.address
    } catch (e) {
      throw new Error('No Account Details connection')
    }
  }

  private async getBalance() {
    try {
      const opts: GetBalanceOpts = {
        addressOrName: AccountCtrl.state.address,
        chainId: AccountCtrl.state.chainId,
        formatUnits: 'ether'
      }
      const balance = await ClientCtrl.ethereum().fetchBalance(opts)
      this.balance = balance
    } catch (e) {
      throw new Error('No Balance Details')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-content>
        <div class="w3m-flex-wrapper">
          <div class="w3m-space-between-container">
            <w3m-ens-image>${ETH_IMG_ACCOUNT}</w3m-ens-image>
            <w3m-button variant="ghost"> Connected </w3m-button>
          </div>
        </div>

        <div>
          <w3m-text variant="medium-normal" color="primary">
            ${`${this.address.substring(0, 5)}...${this.address.slice(-5)}`}
          </w3m-text>
        </div>

        <div class="w3m-space-between-container">
          <w3m-text variant="medium-normal" color="primary">${this.balance} ETH</w3m-text>
          <w3m-text variant="medium-normal" color="primary">${this.balance} ETH</w3m-text>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
