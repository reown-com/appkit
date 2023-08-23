import { AccountCtrl, ClientCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  @state() public loading = false

  // -- private ------------------------------------------------------ //
  private async onDisconnect() {
    if (!this.loading) {
      this.loading = true
      await ClientCtrl.client().disconnect()
      this.loading = false
    }
  }

  private async onCopyAddress() {
    try {
      await navigator.clipboard.writeText(AccountCtrl.state.address ?? '')
      ToastCtrl.openToast('Address copied', 'success')
    } catch {
      ToastCtrl.openToast('Failed to copy', 'error')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-content data-testid="view-account-content">
        <div class="w3m-profile">
          <div class="w3m-info">
            <w3m-avatar size="medium" data-testid="view-account-avatar"></w3m-avatar>
            <w3m-address-text
              variant="modal"
              data-testid="view-account-address-text"
            ></w3m-address-text>
          </div>
          <div class="w3m-connection-badge">
            <w3m-text
              variant="small-regular"
              color="secondary"
              data-testid="view-account-connection-badge"
              >Connected</w3m-text
            >
          </div>
        </div>
      </w3m-modal-content>

      <div class="w3m-balance">
        <w3m-balance data-testid="view-account-balance"></w3m-balance>
      </div>

      <w3m-modal-footer data-testid="view-account-footer">
        <div class="w3m-footer">
          <w3m-account-network-button
            data-testid="view-account-network-button"
          ></w3m-account-network-button>

          <w3m-box-button
            label="Copy Address"
            .onClick=${this.onCopyAddress}
            .icon=${SvgUtil.ACCOUNT_COPY}
            data-testid="view-account-copy-button"
          ></w3m-box-button>

          <w3m-box-button
            label="Disconnect"
            .loading=${this.loading}
            .onClick=${this.onDisconnect}
            .icon=${SvgUtil.ACCOUNT_DISCONNECT}
            data-testid="view-account-disconnect-button"
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
