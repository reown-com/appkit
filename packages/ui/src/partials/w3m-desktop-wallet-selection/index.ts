import {
  ClientCtrl,
  CoreHelpers,
  ExplorerCtrl,
  ModalCtrl,
  RouterCtrl,
  ToastCtrl
} from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-text'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import '../../partials/w3m-walletconnect-qr'
import { COPY_ICON, DESKTOP_ICON, MOBILE_ICON, SCAN_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private onCoinbaseWallet() {
    if (CoreHelpers.isCoinbaseExtension()) RouterCtrl.push('CoinbaseExtensionConnector')
    else RouterCtrl.push('CoinbaseMobileConnector')
  }

  private onLedgerWallet() {
    RouterCtrl.push('DesktopConnector', {
      DesktopConnector: {
        name: 'Ledger Live',
        deeplink: 'ledgerlive'
      }
    })
  }

  private onMetaMaskWallet() {
    RouterCtrl.push('MetaMaskConnector')
  }

  private onInjectedWallet() {
    RouterCtrl.push('InjectedConnector')
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

  private dynamicSlot() {
    const injected = ClientCtrl.ethereum().getConnectorById('injected')
    const metamask = ClientCtrl.ethereum().getConnectorById('metaMask')

    if (injected.ready && injected.name !== metamask.name)
      return this.injectedTemplate(injected.name)

    return this.metaMaskTemplate()
  }

  private async onCopyUri() {
    const { wcUri } = ModalCtrl.state
    if (wcUri) await navigator.clipboard.writeText(wcUri)
    else {
      const uri = await ClientCtrl.ethereum().getActiveWalletConnectUri()
      await navigator.clipboard.writeText(uri)
    }

    ToastCtrl.openToast('WalletConnect link copied', 'success')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { wcUri } = ModalCtrl.state
    const { previewWallets } = ExplorerCtrl.state
    const isViewAll = previewWallets.length > 4
    const previewChunk = isViewAll ? previewWallets.slice(0, 3) : previewWallets

    return html`
      ${dynamicStyles()}

      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onCopyUri}
        .actionIcon=${COPY_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-mobile-title">
          <div class="w3m-subtitle">
            ${MOBILE_ICON}
            <w3m-text variant="small-normal" color="accent">Mobile</w3m-text>
          </div>

          <div class="w3m-subtitle">
            ${SCAN_ICON}
            <w3m-text variant="small-normal" color="tertiary">Scan with your wallet</w3m-text>
          </div>
        </div>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>

      <w3m-modal-footer>
        <div class="w3m-desktop-title">
          ${DESKTOP_ICON}
          <w3m-text variant="small-normal" color="accent">Desktop</w3m-text>
        </div>
        ${wcUri
          ? html`
              <div class="w3m-view-row">
                ${previewChunk.map(
                  wallet => html`
                    <w3m-wallet-button
                      src=${wallet.image_url.lg}
                      name=${wallet.name}
                      .onClick=${this.onLedgerWallet}
                    ></w3m-wallet-button>
                  `
                )}
                ${isViewAll
                  ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                  : null}
              </div>
            `
          : html`
              <div class="w3m-view-row">
                ${this.dynamicSlot()}
                <w3m-wallet-button
                  name="Coinbase Wallet"
                  .onClick=${this.onCoinbaseWallet}
                ></w3m-wallet-button>
                <w3m-wallet-button
                  name="Ledger Live"
                  .onClick=${this.onLedgerWallet}
                ></w3m-wallet-button>
                <w3m-view-all-wallets-button></w3m-view-all-wallets-button>
              </div>
            `}
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-wallet-selection': W3mDesktopWalletSelection
  }
}
