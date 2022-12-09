import type { DesktopConnectorData } from '@web3modal/core'
import {
  ClientCtrl,
  ConfigCtrl,
  CoreUtil,
  ExplorerCtrl,
  OptionsCtrl,
  RouterCtrl
} from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onCoinbaseWallet() {
    if (CoreUtil.isCoinbaseExtension()) {
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
      const { selectedChain } = OptionsCtrl.state
      ClientCtrl.client().connectConnector(id, selectedChain?.id)
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
      ({ name, desktop: { universal, native }, homepage, image_url, id }) => html`
        <w3m-wallet-button
          src=${image_url.lg}
          name=${name}
          .onClick=${() =>
            this.onDesktopWallet({
              walletId: id,
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
    const { isStandalone } = OptionsCtrl.state

    if (isStandalone) {
      return []
    }

    const connectorWallets = ClientCtrl.client().getConnectorWallets()

    return connectorWallets.map(
      ({ id, ready, name }) => html`
        <w3m-wallet-button
          .installed=${ready}
          name=${name}
          walletId=${id}
          .onClick=${() => this.onConnectorWallet(id)}
        ></w3m-wallet-button>
      `
    )
  }

  private recentWalletTemplate() {
    const wallet = UiUtil.getRecentWallet()

    if (!wallet) {
      return undefined
    }

    const { id, name, links, image } = wallet

    return html`
      <w3m-wallet-button
        .recent=${true}
        name=${name}
        walletId=${ifDefined(id)}
        src=${ifDefined(image)}
        .onClick=${() =>
          this.onDesktopWallet({
            name,
            walletId: id,
            universal: links?.universal,
            native: links?.native,
            icon: image
          })}
      ></w3m-wallet-button>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const desktopTemplate = this.desktopWalletsTemplate()
    const previewTemplate = this.previewWalletsTemplate()
    const connectorTemplate = this.connectorWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()
    const linkingWallets = desktopTemplate ?? previewTemplate
    let combinedWallets = [...connectorTemplate, ...linkingWallets]
    if (recentTemplate) {
      const recentWallet = UiUtil.getRecentWallet()
      combinedWallets = combinedWallets.filter(
        wallet => !wallet.values.includes(recentWallet?.name)
      )
      combinedWallets.splice(1, 0, recentTemplate)
    }
    const displayWallets = standaloneUri ? linkingWallets : combinedWallets
    const isViewAll = displayWallets.length > 4
    let wallets = []

    if (isViewAll) {
      const filtered = displayWallets.filter(wallet => !wallet.values.includes('coinbaseWallet'))
      wallets = filtered.slice(0, 3)
    } else {
      wallets = displayWallets
    }

    const isDesktopWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-mobile-title">
          <div class="w3m-subtitle">
            ${SvgUtil.MOBILE_ICON}
            <w3m-text variant="small-normal" color="accent">Mobile</w3m-text>
          </div>

          <div class="w3m-subtitle">
            ${SvgUtil.SCAN_ICON}
            <w3m-text variant="small-normal" color="secondary">Scan with your wallet</w3m-text>
          </div>
        </div>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>

      ${isDesktopWallets
        ? html`
            <w3m-modal-footer>
              <div class="w3m-desktop-title">
                ${SvgUtil.DESKTOP_ICON}
                <w3m-text variant="small-normal" color="accent">Desktop</w3m-text>
              </div>

              <div class="w3m-grid">
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
