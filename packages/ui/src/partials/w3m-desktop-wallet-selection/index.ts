import type { ConnectingData } from '@web3modal/core'
import { ConfigCtrl, ExplorerCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataFilterUtil } from '../../utils/DataFilterUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onConnecting(data: ConnectingData) {
    RouterCtrl.push('Connecting', { Connecting: data })
  }

  private async onConnectorWallet(id: string) {
    await UiUtil.handleConnectorConnection(id)
  }

  private manualWalletsTemplate() {
    const { desktopWallets } = ConfigCtrl.state

    return desktopWallets?.map(
      ({ id, name, links }) => html`
        <w3m-wallet-button
          walletId=${id}
          name=${name}
          .onClick=${() => this.onConnecting({ name, id, desktop: links })}
        ></w3m-wallet-button>
      `
    )
  }

  private recomendedWalletsTemplate() {
    let wallets = DataFilterUtil.allowedExplorerListings(ExplorerCtrl.state.recomendedWallets)
    wallets = DataFilterUtil.deduplicateExplorerListingsFromConnectors(wallets)

    return wallets.map(
      wallet => html`
        <w3m-wallet-button
          walletId=${wallet.id}
          imageId=${wallet.image_id}
          name=${wallet.name}
          .onClick=${() => this.onConnecting(wallet)}
        ></w3m-wallet-button>
      `
    )
  }

  private connectorWalletsTemplate() {
    const wallets = DataFilterUtil.thirdPartyConnectors()

    return wallets.map(
      ({ id, name }) => html`
        <w3m-wallet-button
          name=${name}
          walletId=${id}
          .onClick=${async () => this.onConnectorWallet(id)}
        ></w3m-wallet-button>
      `
    )
  }

  private recentWalletTemplate() {
    const wallet = UiUtil.getRecentWallet()

    if (!wallet) {
      return undefined
    }

    return html`
      <w3m-wallet-button
        name=${wallet.name}
        walletId=${wallet.id}
        imageId=${wallet.image_id}
        .recent=${true}
        .onClick=${() => this.onConnecting(wallet)}
      ></w3m-wallet-button>
    `
  }

  private injectedWalletsTemplate() {
    const { isStandalone } = OptionsCtrl.state
    if (isStandalone) {
      return []
    }
    const wallets = UiUtil.getInstalledInjectedWallets()

    return wallets.map(
      wallet => html`
        <w3m-wallet-button
          .installed=${true}
          name=${wallet.name}
          walletId=${wallet.id}
          imageId=${wallet.image_id}
          .onClick=${() => this.onConnecting(wallet)}
        ></w3m-wallet-button>
      `
    )
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const manualTemplate = this.manualWalletsTemplate()
    const recomendedTemplate = this.recomendedWalletsTemplate()
    const connectorTemplate = this.connectorWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()
    const injectedWallets = this.injectedWalletsTemplate()
    const linkingWallets = [...(manualTemplate ?? []), ...recomendedTemplate]
    const combinedWallets = [...injectedWallets, ...connectorTemplate, ...linkingWallets]
    const combinedWalletsWithRecent = DataFilterUtil.walletTemplatesWithRecent(
      combinedWallets,
      recentTemplate
    )
    const linkingWalletsWithRecent = DataFilterUtil.walletTemplatesWithRecent(
      linkingWallets,
      recentTemplate
    )
    const displayWallets = standaloneUri ? linkingWalletsWithRecent : combinedWalletsWithRecent
    const isViewAll = displayWallets.length > 4
    let wallets = []

    if (isViewAll) {
      wallets = displayWallets.slice(0, 3)
    } else {
      wallets = displayWallets
    }

    const isDesktopWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        .border=${true}
        title="Connect your wallet"
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-mobile-title">
          <div class="w3m-subtitle">
            ${SvgUtil.MOBILE_ICON}
            <w3m-text variant="small-regular" color="accent">Mobile</w3m-text>
          </div>

          <div class="w3m-subtitle">
            ${SvgUtil.SCAN_ICON}
            <w3m-text variant="small-regular" color="secondary">Scan with your wallet</w3m-text>
          </div>
        </div>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>

      ${isDesktopWallets
        ? html`
            <w3m-modal-footer>
              <div class="w3m-desktop-title">
                ${SvgUtil.DESKTOP_ICON}
                <w3m-text variant="small-regular" color="accent">Desktop</w3m-text>
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
