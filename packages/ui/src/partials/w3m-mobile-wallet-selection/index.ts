import type { WalletRouteData } from '@web3modal/core'
import { ConfigCtrl, ExplorerCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { InjectedId } from '../../presets/EthereumPresets'
import { DataFilterUtil } from '../../utils/DataFilterUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onGoToQrcode() {
    RouterCtrl.push('Qrcode')
  }

  private onGoToIosConnector(data: WalletRouteData) {
    RouterCtrl.push('IosConnector', { IosConnector: data })
  }

  private async onConnectorWallet(id: string) {
    await UiUtil.handleConnectorConnection(id)
  }

  private mobileWalletsTemplate() {
    const { mobileWallets } = ConfigCtrl.state
    const wallets = DataFilterUtil.walletsWithInjected(mobileWallets)

    if (wallets.length) {
      return wallets.map(
        ({ id, name, links }) => html`
          <w3m-wallet-button
            name=${name}
            walletId=${id}
            .onClick=${() => {
              this.onGoToIosConnector({
                id,
                name,
                nativeUrl: links.native,
                universalUrl: links.universal
              })
            }}
          ></w3m-wallet-button>
        `
      )
    }

    return undefined
  }

  private recomendedWalletsTemplate() {
    const { recomendedWallets } = ExplorerCtrl.state
    let wallets = DataFilterUtil.walletsWithInjected(recomendedWallets)
    wallets = DataFilterUtil.allowedExplorerListings(wallets)
    wallets = DataFilterUtil.deduplicateExplorerListingsFromConnectors(wallets)

    return wallets.map(
      ({ image_id, name, mobile, id, app }) => html`
        <w3m-wallet-button
          name=${name}
          walletId=${id}
          imageId=${image_id}
          .onClick=${() => {
            this.onGoToIosConnector({
              id,
              name,
              nativeUrl: mobile.native,
              universalUrl: mobile.universal,
              imageId: image_id,
              downloadUrl: app.ios
            })
          }}
        ></w3m-wallet-button>
      `
    )
  }

  private connectorWalletsTemplate() {
    let wallets = DataFilterUtil.connectorWallets()

    if (!window.ethereum) {
      wallets = wallets.filter(({ id }) => id !== 'injected' && id !== InjectedId.metaMask)
    }

    return wallets.map(
      ({ name, id, ready }) => html`
        <w3m-wallet-button
          .installed=${['injected', 'metaMask'].includes(id) && ready}
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

    const { id, name, imageId } = wallet

    return html`
      <w3m-wallet-button
        .recent=${true}
        name=${name}
        walletId=${id}
        imageId=${imageId}
        .onClick=${() => {
          this.onGoToIosConnector(wallet)
        }}
      ></w3m-wallet-button>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const connectorTemplate = this.connectorWalletsTemplate()
    const mobileTemplate = this.mobileWalletsTemplate()
    const recomendedTemplate = this.recomendedWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()
    const linkingWallets = mobileTemplate ?? recomendedTemplate
    const combinedWallets = [...connectorTemplate, ...linkingWallets]
    const combinedWalletsWithRecent = DataFilterUtil.walletTemplatesWithRecent(
      combinedWallets,
      recentTemplate
    )
    const linkingWalletsWithRecent = DataFilterUtil.walletTemplatesWithRecent(
      linkingWallets,
      recentTemplate
    )
    const displayWallets = standaloneUri ? linkingWalletsWithRecent : combinedWalletsWithRecent
    const isViewAll = displayWallets.length > 8
    let wallets = []

    if (isViewAll) {
      wallets = displayWallets.slice(0, 7)
    } else {
      wallets = displayWallets
    }

    const row1 = wallets.slice(0, 4)
    const row2 = wallets.slice(4, 8)
    const isMobileWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onGoToQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
      ></w3m-modal-header>

      ${isMobileWallets
        ? html`
            <w3m-modal-content>
              <div class="w3m-grid">
                ${row1}
                ${row2.length
                  ? html`
                      ${row2}
                      ${isViewAll
                        ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                        : null}
                    `
                  : null}
              </div>
            </w3m-modal-content>
          `
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
