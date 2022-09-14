import { ClientCtrl, ConnectModalCtrl, CoreHelpers, ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private async onConnect(links: { native: string; universal?: string }) {
    const { native, universal } = links
    await ClientCtrl.ethereum().connectLinking(uri =>
      window.open(
        universal
          ? CoreHelpers.formatUniversalUrl(universal, uri)
          : CoreHelpers.formatNativeUrl(native, uri),
        '_self'
      )
    )
    ConnectModalCtrl.closeModal()
  }

  private async onCoinbaseWallet() {
    await ClientCtrl.ethereum().connectCoinbaseMobile()
    ConnectModalCtrl.closeModal()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { previewWallets } = ExplorerCtrl.state

    return html`
      <div class="w3m-view-row">
        ${previewWallets.map(
          wallet => html`
            <w3m-wallet-button
              class="w3m-coinbase-button"
              src=${wallet.image_url.lg}
              name=${wallet.name}
              .onClick=${async () => this.onConnect(wallet.mobile)}
            ></w3m-wallet-button>
          `
        )}
        <w3m-wallet-button
          name="Coinbase Wallet"
          .onClick=${this.onCoinbaseWallet}
        ></w3m-wallet-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
