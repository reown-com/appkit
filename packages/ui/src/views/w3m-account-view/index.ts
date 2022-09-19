import { AccountCtrl, ClientCtrl, ConnectModalCtrl } from '@web3modal/core'
import type { FetchEnsAvatarOpts, GetBalanceOpts } from '@web3modal/ethereum'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-footer'
import '../../components/w3m-text'
import '../../components/w3m-zorb-ens-image'
import { CLIPBOARD, CONNECTED_INDICATOR, DISCONNECT, ETH_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { formatAddress, roundBalance } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address = ''
  @state() private balance = ''
  @state() private ens = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getAccounts()
    this.getBalance()
    this.getENSAvatar()
  }

  // -- private ------------------------------------------------------ //
  private getAccounts() {
    try {
      this.address = AccountCtrl.state.address
    } catch (e) {
      throw new Error('No Account Details connection')
    }
  }

  private async copyClipboard() {
    await navigator.clipboard.writeText(this.address)
  }

  private onDisconnect() {
    ConnectModalCtrl.closeModal()
    ClientCtrl.ethereum().disconnect()
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

  private async getENSAvatar() {
    try {
      const opts: FetchEnsAvatarOpts = {
        addressOrName: AccountCtrl.state.address,
        chainId: AccountCtrl.state.chainId
      }
      const ens = await ClientCtrl.ethereum().fetchEnsAvatar(opts)
      if (ens) this.ens = ens
    } catch (e) {
      throw new Error('No Balance Details')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <div>
        <div class="w3m-flex-wrapper">
          <div class="w3m-space-between-container">
            <div style="display:flex; flex-direction:column;">
            <w3m-zorb-ens-image ens=${this.ens} address=${this.address} size="lg">
            </w3m-zorb-ens-image>
              <w3m-text variant="large-bold" color="primary">
              ${formatAddress(this.address)}              
              </w3m-text>
            </div>
            <div class="w3m-connected-container">
              <div>${CONNECTED_INDICATOR}</div>
              <w3m-text variant="small-normal" color="secondary">Connected</w3m-text>
            </div>
            </div>
          </div>
        </div>

        <div class="w3m-account-divider"></div>

        <div class="w3m-balance-container">
          <div class="w3m-token-bal-container">
            <w3m-text variant="medium-normal" color="secondary">Balance</w3m-text>
          </div>
          <div class="w3m-token-bal-container">
            <div class="w3m-eth-logo-container">${ETH_LOGO}</div>
            <w3m-text variant="medium-normal" color="primary">${roundBalance(
              this.balance
            )} ETH</w3m-text>
          </div>
        </div>

        <w3m-modal-footer>
          <div class="w3m-footer-action-container">
            <button class="w3m-footer-actions" @click=${this.copyClipboard}>
              <div>${CLIPBOARD}</div>
              <w3m-text variant="small-normal" color="secondary">Copy Address</w3m-text>
            </button>

            <button class="w3m-footer-actions" @click=${this.onDisconnect}>
              <div>${DISCONNECT}</div>
              <w3m-text variant="small-normal" color="secondary">Disconnect</w3m-text>
            </button>
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
