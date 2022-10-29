import { until } from 'lit/directives/until.js'
import type { Listing } from '@web3modal/core'
import { ClientCtrl, ConnectModalCtrl, CoreHelpers, ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.ethereum().getConnectorById('injected')

  private async getWcUri() {
    return new Promise<string>(resolve => {
      ClientCtrl.solana().connectLinking(
        uri => resolve(uri),
        () => {
          ConnectModalCtrl.closeModal()
        }
      )
    })
  }

  private async onCoinbaseWallet() {
    await ClientCtrl.ethereum().connectCoinbaseMobile()
    ConnectModalCtrl.closeModal()
  }

  private getListingUrl(listing: Listing, uri: string) {
    const { native, universal } = CoreHelpers.isMobile() ? listing.mobile : listing.desktop

    const href = universal
      ? CoreHelpers.formatUniversalUrl(universal, uri, listing.name)
      : CoreHelpers.formatNativeUrl(native, uri, listing.name)

    return href
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const listings = ExplorerCtrl.state.previewWallets

    const listingButtons = this.getWcUri().then(uri => {
      return html`
        ${listings.map(
          listing => html`
            <w3m-wallet-button
              src=${listing.image_url.lg}
              name=${listing.name}
              .onClick=${() => CoreHelpers.openHref(this.getListingUrl(listing, uri))}
            >
            </w3m-wallet-button>
          `
        )}
        <w3m-wallet-button
          name="Coinbase Wallet"
          .onClick=${this.onCoinbaseWallet}
        ></w3m-wallet-button>
        <w3m-view-all-wallets-button></w3m-view-all-wallets-button>
      `
    })

    return html` <div class="w3m-view-row">${until(listingButtons, '')}</div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
