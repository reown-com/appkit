import { AccountCtrl, ClientCtrl } from '@web3modal/core'
import type { GetBalanceOpts } from '@web3modal/ethereum'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-footer'
import '../../components/w3m-text'
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

  // private disconnect() {
  //   ClientCtrl.ethereum.disconnect
  // }

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
      <div>
        <div class="w3m-flex-wrapper">
          <div class="w3m-address-ens-container">
            <div style="display:flex; flex-direction:column;">
              <w3m-ens-image>${ETH_IMG_ACCOUNT}</w3m-ens-image>
              <w3m-text variant="large-bold" color="primary">
                ${`${this.address.substring(0, 5)}...${this.address.slice(-5)}`}
              </w3m-text>
            </div>
            <w3m-button variant="ghost"> Connected </w3m-button>
          </div>
        </div>

        <div
          style="background-color: #000000; width: 100%; height: 1px; padding: 24px 0px 24px "
        ></div>

        <div class="w3m-space-between-container">
          <w3m-text variant="medium-normal" color="secondary">Balance</w3m-text>
          <w3m-text variant="medium-normal" color="primary">${this.balance} ETH</w3m-text>
        </div>

        <w3m-modal-footer>
          <div class="w3m-space-between-container">
            <w3m-button variant="ghost"> Disconnect </w3m-button>
            <w3m-button variant="ghost"> Disconnect </w3m-button>
            <w3m-button variant="ghost"> Disconnect </w3m-button>
          </div>
        </w3m-modal-footer>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
