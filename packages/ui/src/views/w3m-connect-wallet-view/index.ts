import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../partials/w3m-desktop-wallet-selection'
import '../../partials/w3m-wallets-slideshow'
import { HELP_ICON, WALLET_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly learnUrl = 'https://ethereum.org/en/wallets/'

  private onGetWallet() {
    RouterCtrl.push('GetWallet')
  }

  private onLearnMore() {
    window.open(this.learnUrl, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      <w3m-modal-content>
        <w3m-desktop-wallet-selection></w3m-desktop-wallet-selection>
      </w3m-modal-content>
      <w3m-modal-footer>
        <w3m-wallets-slideshow></w3m-wallets-slideshow>
        <div class="w3m-footer-actions">
          <w3m-button .iconLeft=${WALLET_ICON} .onClick=${this.onGetWallet}>
            Get a Wallet
          </w3m-button>
          <w3m-button
            .iconLeft=${HELP_ICON}
            variant="ghost"
            .onClick=${this.onLearnMore.bind(this)}
          >
            Learn More
          </w3m-button>
        </div>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
