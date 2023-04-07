import { AccountCtrl, ClientCtrl, ModalCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private async onDisconnect() {
    await ClientCtrl.client().disconnect()
    ModalCtrl.close()
    AccountCtrl.resetAccount()
  }

  private async onCopyAddress() {
    await navigator.clipboard.writeText(AccountCtrl.state.address ?? '')
    ToastCtrl.openToast('Address copied', 'success')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-content>
        <div class="w3m-profile">
          <div class="w3m-info">
            <w3m-avatar size="medium"></w3m-avatar>
            <w3m-address-text variant="modal"></w3m-address-text>
          </div>
          <div class="w3m-connection-badge">
            <w3m-text variant="small-regular" color="secondary">Connected</w3m-text>
          </div>
        </div>
      </w3m-modal-content>

      <div class="w3m-balance">
        <w3m-balance></w3m-balance>
      </div>

      <w3m-modal-footer>
        <div class="w3m-footer">
          <w3m-account-network-button></w3m-account-network-button>

          <w3m-box-button
            label="Copy Address"
            .onClick=${this.onCopyAddress}
            .icon=${SvgUtil.ACCOUNT_COPY}
          ></w3m-box-button>

          <w3m-box-button
            label="Disconnect"
            .onClick=${this.onDisconnect}
            .icon=${SvgUtil.ACCOUNT_DISCONNECT}
          ></w3m-box-button>
        </div>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
