import { AccountCtrl, ClientCtrl, ConnectModalCtrl, ModalToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-hexagon-button'
import '../../components/w3m-modal-footer'
import '../../components/w3m-round-button'
import '../../components/w3m-text'
import '../../components/w3m-zorb-ens-image'
import { CONNECTED_INDICATOR, COPY_ICON, DISCONNECT, ETH_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
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
  }

  private async copyClipboard() {
    await navigator.clipboard.writeText(this.address)
    ModalToastCtrl.openToast('Copied address', 'success')
  }

  private onDisconnect() {
    ConnectModalCtrl.closeModal()
    ClientCtrl.ethereum().disconnect()
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe?.()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

        <div class="w3m-flex-wrapper">
          <div class="w3m-space-between-container">
            <div style="display:flex; flex-direction:column;">
            <w3m-zorb-ens-image ens=${this.ensAvatar} address=${this.address} size="60">
            </w3m-zorb-ens-image>
              <w3m-address variant="large-bold" address=${this.address}></w3m-address>
            </div>
            <div class="w3m-connected-container">
              <div>${CONNECTED_INDICATOR}</div>
              <w3m-text variant="small-normal" color="secondary">Connected</w3m-text>
            </div>
            </div>
          </div>
        </div>

        <div class="w3m-balance-container">
          <div class="w3m-token-bal-container">
            <w3m-text variant="medium-normal" color="secondary">Balance</w3m-text>
          </div>

          <w3m-balance 
            variant="medium-normal"
            .icon=${ETH_LOGO} 
            balance=${this.balance}>
          </w3m-balance>

        </div>

        <w3m-modal-footer>
          <div class="w3m-footer-action-container">
          
            <w3m-round-button 
              .onClick=${this.copyClipboard} 
              .icon=${COPY_ICON} 
              text="Copy Address">
            </w3m-round-button>

            <w3m-round-button 
              .onClick=${this.onDisconnect} 
              .icon=${DISCONNECT} 
              text="Disconnect">
            </w3m-round-button>

          </div>
        </w3m-modal-footer>

        <w3m-modal-toast></w3m-modal-toast>

    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
