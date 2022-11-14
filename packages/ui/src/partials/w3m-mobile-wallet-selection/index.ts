import { ClientCtrl, ExplorerCtrl, ModalCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import { QRCODE_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { handleMobileLinking } from '../../utils/UiHelpers'
import styles from './styles'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private async onCoinbaseWallet() {
    await ClientCtrl.connectCoinbaseMobile(() => null, OptionsCtrl.state.selectedChainId)
    ModalCtrl.close()
  }

  private onGoToQrcode() {
    RouterCtrl.push('Qrcode')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const listings = ExplorerCtrl.state.previewWallets
    const row1 = listings.slice(0, 4)
    const row2 = standaloneUri ? listings.slice(4, 7) : listings.slice(4, 6)

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onGoToQrcode}
        .actionIcon=${QRCODE_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-view-row">
          ${row1.map(
            listing => html`
              <w3m-wallet-button
                src=${listing.image_url.lg}
                name=${listing.name}
                .onClick=${async () => handleMobileLinking(listing.mobile, listing.name)}
              ></w3m-wallet-button>
            `
          )}
        </div>

        <div class="w3m-view-row">
          ${row2.map(
            listing => html`
              <w3m-wallet-button
                src=${listing.image_url.lg}
                name=${listing.name}
                .onClick=${async () => handleMobileLinking(listing.mobile, listing.name)}
              ></w3m-wallet-button>
            `
          )}
          ${standaloneUri
            ? null
            : html`
                <w3m-wallet-button
                  name="Coinbase Wallet"
                  .onClick=${this.onCoinbaseWallet}
                ></w3m-wallet-button>
              `}

          <w3m-view-all-wallets-button></w3m-view-all-wallets-button>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
