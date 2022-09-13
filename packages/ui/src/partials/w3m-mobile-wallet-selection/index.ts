import { ExplorerCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    const { listings } = ExplorerCtrl.state.wallets

    return html`
      <div class="w3m-view-row">
        ${listings.map(
          listing => html`
            <w3m-wallet-button
              class="w3m-coinbase-button"
              src=${listing.image_url.lg}
              name=${listing.name}
              .onClick=${() => console.log(listing.name)}
            ></w3m-wallet-button>
          `
        )}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
