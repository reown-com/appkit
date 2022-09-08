import { ClientCtrl, RouterCtrl } from '@web3modal/core'
import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-text'
import '../../components/w3m-wallet-button'
import '../../components/w3m-walletconnect-button'
import { DESKTOP_ICON, HELP_ICON, MOBILE_ICON, WALLET_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly learnUrl = 'https://ethereum.org/en/wallets/'

  private onWalletConnect() {
    RouterCtrl.push('WalletConnectConnector')
  }

  private onCoinbaseWallet() {
    if (window.coinbaseWalletExtension) RouterCtrl.push('CoinbaseExtensionConnector')
    else RouterCtrl.push('CoinbaseMobileConnector')
  }

  private onLedgerWallet() {
    RouterCtrl.push('LedgerDesktopConnector')
  }

  private onMetaMaskWallet() {
    RouterCtrl.push('MetaMaskConnector')
  }

  private onInjectedWallet() {
    RouterCtrl.push('InjectedConnector')
  }

  private onGetWallet() {
    RouterCtrl.push('GetWallet')
  }

  private onLearnMore() {
    window.open(this.learnUrl, '_blank')
  }

  private metaMaskTemplate() {
    return html`
      <w3m-wallet-button name="MetaMask" .onClick=${this.onMetaMaskWallet}></w3m-wallet-button>
    `
  }

  private injectedTemplate(name: string) {
    return html`
      <w3m-wallet-button name=${name} .onClick=${this.onInjectedWallet}></w3m-wallet-button>
    `
  }

  private dynamicSlots() {
    const injected = ClientCtrl.ethereum().getConnectorById('injected')
    const metamask = ClientCtrl.ethereum().getConnectorById('metaMask')
    let slot1: TemplateResult<1> | null = null
    let slot2: TemplateResult<1> | null = null
    if (injected.ready && !metamask.ready) {
      slot1 = this.injectedTemplate(injected.name)
      slot2 = this.metaMaskTemplate()
    } else if (metamask.ready && injected.ready && injected.name !== 'MetaMask') {
      slot1 = this.metaMaskTemplate()
      slot2 = this.injectedTemplate(injected.name)
    } else {
      slot1 = this.metaMaskTemplate()
      slot2 = this.injectedTemplate('Brave Wallet')
    }

    return { slot1, slot2 }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { slot1, slot2 } = this.dynamicSlots()

    return html`
      ${dynamicStyles()}

      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-title">
          ${MOBILE_ICON}
          <w3m-text variant="small-normal" color="secondary">Mobile</w3m-text>
        </div>
        <div class="w3m-view-row">
          <w3m-walletconnect-button .onClick=${this.onWalletConnect}></w3m-walletconnect-button>
          <w3m-wallet-button name="Coinbase" .onClick=${this.onCoinbaseWallet}></w3m-wallet-button>
        </div>

        <div class="w3m-title w3m-title-desktop">
          ${DESKTOP_ICON}
          <w3m-text variant="small-normal" color="secondary">Desktop</w3m-text>
        </div>
        <div class="w3m-view-row">
          ${slot1} ${slot2}
          <w3m-wallet-button name="Ledger Live" .onClick=${this.onLedgerWallet}></w3m-wallet-button>
          <w3m-wallet-button name="View All" .onClick=${this.onCoinbaseWallet}></w3m-wallet-button>
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>
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
