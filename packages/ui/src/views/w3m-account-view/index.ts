import { AccountCtrl, ClientCtrl, ModalCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onDisconnect() {
    ModalCtrl.close()
    ClientCtrl.client().disconnect()
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
            <w3m-text variant="small-normal" color="secondary">Connected</w3m-text>
          </div>
        </div>
      </w3m-modal-content>

      <w3m-modal-footer>
        <div class="w3m-footer-actions">
          <w3m-box-button label="Disconnect" .onClick=${this.onDisconnect}></w3m-box-button>
          <w3m-box-button label="Copy Address" .onClick=${this.onCopyAddress}></w3m-box-button>
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
