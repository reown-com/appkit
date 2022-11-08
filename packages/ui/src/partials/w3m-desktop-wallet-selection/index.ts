import { ClientCtrl, CoreHelpers, ExplorerCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import '../../components/w3m-text'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import '../../partials/w3m-walletconnect-qr'
import { scss } from '../../style/utils'
import { COPY_ICON, DESKTOP_ICON, MOBILE_ICON, SCAN_ICON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import { handleUriCopy } from '../../utils/UiHelpers'
import styles from './styles.css'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private onCoinbaseWallet() {
    if (CoreHelpers.isCoinbaseExtension()) RouterCtrl.push('CoinbaseExtensionConnector')
    else RouterCtrl.push('CoinbaseMobileConnector')
  }

  private dynamicStyles() {
    const { foreground } = color()

    return html`<style>
      .w3m-mobile-title path,
      .w3m-desktop-title path {
        fill: ${foreground.accent};
      }

      .w3m-subtitle:last-child path {
        fill: ${foreground[3]};
      }
    </style>`
  }

  private onDesktopWallet(name: string, deeplink?: string, universal?: string, icon?: string) {
    RouterCtrl.push('DesktopConnector', {
      DesktopConnector: { name, deeplink, universal, icon }
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

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const { previewWallets } = ExplorerCtrl.state
    const isViewAll = previewWallets.length > 4
    const previewChunk = isViewAll ? previewWallets.slice(0, 3) : previewWallets

    return html`
      ${this.dynamicStyles()}

      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${handleUriCopy}
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

        ${standaloneUri
          ? html`
              <div class="w3m-view-row">
                ${previewChunk.map(
                  wallet => html`
                    <w3m-wallet-button
                      src=${wallet.image_url.lg}
                      name=${wallet.name}
                      .onClick=${() =>
                        this.onDesktopWallet(
                          wallet.name,
                          wallet.desktop.native,
                          wallet.desktop.universal || wallet.homepage,
                          wallet.image_url.lg
                        )}
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
                  .onClick=${() =>
                    this.onDesktopWallet(
                      'Ledger Live',
                      'ledgerlive',
                      'https://www.ledger.com/ledger-live'
                    )}
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
