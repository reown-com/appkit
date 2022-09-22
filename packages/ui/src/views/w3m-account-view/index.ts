import { AccountCtrl, ClientCtrl, ConnectModalCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-footer'
import '../../components/w3m-text'
import '../../components/w3m-zorb-ens-image'
import { CLIPBOARD_BLUE, CONNECTED_INDICATOR, DISCONNECT, ETH_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { formatAddress, roundBalance } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address = ''
  @state() private balance = ''
  @state() private ensAvatar = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.subscribeAccountChanges()
    // this.getAccounts()
    // this.getBalance()
    // this.getENSAvatar()
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

  private async copyClipboard() {
    await navigator.clipboard.writeText(this.address)
  }

  private onDisconnect() {
    ConnectModalCtrl.closeModal()
    ClientCtrl.ethereum().disconnect()
  }

  // -- render ------------------------------------------------------- //
  // eslint-disable-next-line no-warning-comments
  // ToDo: Optimize CLIPBOARD_BLUE and DISCONNECT ICON with blueBackground

  protected render() {
    return html`
      ${dynamicStyles()}

      <div>
        <div class="w3m-flex-wrapper">
          <div class="w3m-space-between-container">
            <div style="display:flex; flex-direction:column;">
            <w3m-zorb-ens-image ens=${this.ensAvatar} address=${this.address} size="60">
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
              <div>${CLIPBOARD_BLUE}</div>
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
