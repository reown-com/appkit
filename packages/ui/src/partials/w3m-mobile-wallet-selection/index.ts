import { ClientCtrl, CoreHelpers, ExplorerCtrl, ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import { compareTwoStrings } from '../../utils/UiHelpers'
import styles from './styles'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.ethereum().getConnectorById('injected')

  private async onConnect(links: { native: string; universal?: string }, name: string) {
    const { ready } = this.connector
    const isNameSimilar = compareTwoStrings(name, this.connector.name) >= 0.5

    if (ready && isNameSimilar)
      await ClientCtrl.ethereum().connectInjected(OptionsCtrl.state.selectedChainId)
    else {
      const { native, universal } = links
      await ClientCtrl.ethereum().connectLinking(uri => {
        const href = universal
          ? CoreHelpers.formatUniversalUrl(universal, uri, name)
          : CoreHelpers.formatNativeUrl(native, uri, name)
        CoreHelpers.openHref(href)
      }, OptionsCtrl.state.selectedChainId)
    }
    ModalCtrl.close()
  }

  private async onCoinbaseWallet() {
    await ClientCtrl.ethereum().connectCoinbaseMobile(() => null, OptionsCtrl.state.selectedChainId)
    ModalCtrl.close()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const listings = ExplorerCtrl.state.previewWallets
    const row1 = listings.slice(0, 4)
    const row2 = listings.slice(4, 6)

    return html`
      <w3m-modal-content>
        <div class="w3m-view-row">
          ${row1.map(
            listing => html`
              <w3m-wallet-button
                src=${listing.image_url.lg}
                name=${listing.name}
                .onClick=${async () => this.onConnect(listing.mobile, listing.name)}
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
                .onClick=${async () => this.onConnect(listing.mobile, listing.name)}
              ></w3m-wallet-button>
            `
          )}
          <w3m-wallet-button
            name="Coinbase Wallet"
            .onClick=${this.onCoinbaseWallet}
          ></w3m-wallet-button>
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
