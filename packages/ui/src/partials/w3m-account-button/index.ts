import { AccountCtrl, ClientCtrl, ConnectModalCtrl, RouterCtrl } from '@web3modal/core'
import type { FetchEnsAvatarOpts, GetBalanceOpts } from '@web3modal/ethereum'
import { html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-text'
import '../../components/w3m-zorb-ens-image'

import { CHEVRON, ETH_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import { formatAddress, roundBalance, useScript, ZorbPackageScript } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
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

  // Move to AccountCtrl?
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

  private onOpen() {
    RouterCtrl.replace('Account')
    ConnectModalCtrl.openModal()
  }

  // -- render ------------------------------------------------------- //

  protected render() {
    return html`
      ${dynamicStyles()}
      <button class="w3m-act-button-container" @click=${this.onOpen}>
        <div class="w3m-act-balance-container">
          <div class="w3m-eth-logo-container">${ETH_LOGO}</div>
          <w3m-text variant="medium-normal" color="primary">${roundBalance(
            this.balance
          )} ETH</w3m-text>
        </div>
        <div class="w3m-address-container">
          <div class="w3m-ens-zorb-container">
            <w3m-zorb-ens-image address=${this.address} size="sm" ens=${
      this.ens
    }> </w3m-zorb-ens-image>
          </div>
          <w3m-text variant="medium-normal" color="primary">${formatAddress(
            this.address
          )}</w3m-text>
          <div class="w3m-chevron-container">${CHEVRON}</div>
        </div>
      </buttom>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
