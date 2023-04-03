import type { ConnectingData } from '@web3modal/core'
import { ConfigCtrl, ExplorerCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataUtil } from '../../utils/DataUtil'
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

  private onConnecting(data: ConnectingData) {
    RouterCtrl.push('Connecting', { Connecting: data })
  }

  private async onConnectorWallet(id: string) {
    await UiUtil.handleConnectorConnection(id)
  }

  private mobileWalletsTemplate() {
    const { mobileWallets } = ConfigCtrl.state
    const wallets = DataUtil.walletsWithInjected(mobileWallets)

    if (!wallets.length) {
      return undefined
    }

    return wallets.map(
      ({ id, name, links }) => html`
        <w3m-wallet-button
          name=${name}
          walletId=${id}
          .onClick=${() => {
            this.onConnecting({ id, name, mobile: links })
          }}
        ></w3m-wallet-button>
      `
    )
  }

  private recomendedWalletsTemplate() {
    const { recomendedWallets } = ExplorerCtrl.state
    let wallets = DataUtil.walletsWithInjected(recomendedWallets)
    wallets = DataUtil.allowedExplorerListings(wallets)
    wallets = DataUtil.deduplicateExplorerListingsFromConnectors(wallets)

    return wallets.map(
      wallet => html`
        <w3m-wallet-button
          name=${wallet.name}
          walletId=${wallet.id}
          imageId=${wallet.image_id}
          .onClick=${() => this.onConnecting(wallet)}
        ></w3m-wallet-button>
      `
    )
  }

  private connectorWalletsTemplate() {
    const wallets = DataUtil.externalWallets()

    return wallets.map(
      ({ name, id }) => html`
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
        .recent=${true}
        name=${wallet.name}
        walletId=${wallet.id}
        imageId=${wallet.image_id}
        .onClick=${() => this.onConnecting(wallet)}
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
    const combinedWalletsWithRecent = DataUtil.walletTemplatesWithRecent(
      combinedWallets,
      recentTemplate
    )
    const linkingWalletsWithRecent = DataUtil.walletTemplatesWithRecent(
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
