import { ClientCtrl, ConnectModalCtrl, CoreHelpers, ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
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

    if (ready && isNameSimilar) await ClientCtrl.ethereum().connectInjected()
    else {
      const { native, universal } = links
      await ClientCtrl.ethereum().connectLinking(uri => {
        const href = universal
          ? CoreHelpers.formatUniversalUrl(universal, uri, name)
          : CoreHelpers.formatNativeUrl(native, uri, name)
        CoreHelpers.openHref(href)
      })
    }
    ConnectModalCtrl.closeModal()
  }

  private async onCoinbaseWallet() {
    await ClientCtrl.ethereum().connectCoinbaseMobile()
    ConnectModalCtrl.closeModal()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const listings = ExplorerCtrl.state.previewWallets

    return html`
      <div class="w3m-view-row">
        ${listings.map(
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
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
