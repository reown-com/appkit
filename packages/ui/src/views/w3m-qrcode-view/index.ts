import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-text'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import '../../partials/w3m-walletconnect-qr'
import { COPY_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { handleUriCopy } from '../../utils/UiHelpers'

@customElement('w3m-qrcode-view')
export class W3mQrcodeView extends LitElement {
  public static styles = [global]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header
        title="Scan the code"
        .onAction=${handleUriCopy}
        .actionIcon=${COPY_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode-view': W3mQrcodeView
  }
}
