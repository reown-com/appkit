import type { DesktopConnectorData } from '@web3modal/core'
import {
  ClientCtrl,
  ConfigCtrl,
  CoreHelpers,
  ExplorerCtrl,
  OptionsCtrl,
  RouterCtrl
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
import { handleUriCopy } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private onCoinbaseWallet() {
    if (CoreHelpers.isCoinbaseExtension()) {
      RouterCtrl.push('CoinbaseExtensionConnector')
    } else {
      RouterCtrl.push('CoinbaseMobileConnector')
    }
  }

  private onDesktopWallet(data: DesktopConnectorData) {
    RouterCtrl.push('DesktopConnector', { DesktopConnector: data })
  }

  private onInjectedWallet() {
    RouterCtrl.push('InjectedConnector')
  }

  private onMetaMask() {
    RouterCtrl.push('MetaMaskConnector')
  }

  private onConnectorWallet(id: string) {
    if (id === 'coinbaseWallet') {
      this.onCoinbaseWallet()
    } else if (id === 'metaMask' || !window.ethereum) {
      this.onMetaMask()
    } else if (id === 'injected') {
      this.onInjectedWallet()
    } else {
      const { selectedChainId } = OptionsCtrl.state
      ClientCtrl.client().connectConnector(id, selectedChainId)
    }
  }

  private desktopWalletsTemplate() {
    const { desktopWallets } = ConfigCtrl.state

    return desktopWallets?.map(
      ({ id, name, links: { universal, native } }) => html`
        <w3m-wallet-button
          walletId=${id}
          name=${name}
          .onClick=${() => this.onDesktopWallet({ name, walletId: id, universal, native })}
        ></w3m-wallet-button>
      `
    )
  }

  private previewWalletsTemplate() {
    const { previewWallets } = ExplorerCtrl.state

    return previewWallets.map(
      ({ name, desktop: { universal, native }, homepage, image_url }) => html`
        <w3m-wallet-button
          src=${image_url.lg}
          name=${name}
          .onClick=${() =>
            this.onDesktopWallet({
              name,
              native,
              universal: universal || homepage,
              icon: image_url.lg
            })}
        ></w3m-wallet-button>
      `
    )
  }

  private connectorWalletsTemplate() {
    const connectorWallets = ClientCtrl.client().getConnectorWallets()

    return connectorWallets.map(
      wallet => html`
        <w3m-wallet-button
          name=${wallet.name}
          walletId=${wallet.id}
          .onClick=${() => this.onConnectorWallet(wallet.id)}
        ></w3m-wallet-button>
      `
    )
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const desktopTemplate = this.desktopWalletsTemplate()
    const previewTemplate = this.previewWalletsTemplate()
    const connectorTemplate = this.connectorWalletsTemplate()
    const linkingWallets = desktopTemplate ?? previewTemplate
    const combinedWallets = [...connectorTemplate, ...linkingWallets]
    const displayWallets = standaloneUri ? linkingWallets : combinedWallets
    const isViewAll = displayWallets.length > 4
    const wallets = isViewAll ? displayWallets.slice(0, 3) : displayWallets
    const isDesktopWallets = Boolean(wallets.length)

    return html`
      ${dynamicStyles()}

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

      ${isDesktopWallets
        ? html`
            <w3m-modal-footer>
              <div class="w3m-desktop-title">
                ${DESKTOP_ICON}
                <w3m-text variant="small-normal" color="accent">Desktop</w3m-text>
              </div>

              <div class="w3m-view-row">
                ${wallets}
                ${isViewAll
                  ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                  : null}
              </div>
            </w3m-modal-footer>
          `
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-wallet-selection': W3mDesktopWalletSelection
  }
}
