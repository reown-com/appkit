import { AccountCtrl, ConnectModalCtrl, RouterCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-text'
import '../../components/w3m-zorb-ens-image'

import { CHEVRON, ETH_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import { formatAddress, roundBalance } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-button')
export class W3mAccountButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address = ''
  @state() private balance = ''
  @state() private ensAvatar = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.subscribeAccountChanges()
  }

  // -- private ------------------------------------------------------ //

  private unsubscribe?: () => void = undefined

  private subscribeAccountChanges() {
    this.address = AccountCtrl.state.address
    this.balance = AccountCtrl.state.balance
    this.ensAvatar = AccountCtrl.state.ensAvatar

    this.unsubscribe = AccountCtrl.subscribe(() => {
      this.address = AccountCtrl.state.address
      this.ensAvatar = AccountCtrl.state.ensAvatar
      this.balance = AccountCtrl.state.balance
    })

    return () => this.unsubscribe
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
            <w3m-zorb-ens-image address=${this.address} ens=${
      this.ensAvatar
    } size="24"></w3m-zorb-ens-image>
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
