import type { ConnectingData } from '@web3modal/core'
import { OptionsCtrl, RouterCtrl } from '@web3modal/core'
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
  private onQrcode() {
    RouterCtrl.push('Qrcode')
  }

  private onConnecting(data: ConnectingData) {
    RouterCtrl.push('Connecting', { Connecting: data })
  }

  private onExternal(id: string) {
    UiUtil.handleConnectorConnection(id)
  }

  private manualWalletsTemplate() {
    const wallets = DataUtil.manualMobileWallets()

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
    const wallets = DataUtil.recomendedWallets()

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

  private externalWalletsTemplate() {
    const wallets = DataUtil.externalWallets()

    return wallets.map(
      ({ name, id }) => html`
        <w3m-wallet-button
          name=${name}
          walletId=${id}
          .onClick=${() => this.onExternal(id)}
        ></w3m-wallet-button>
      `
    )
  }

  private recentWalletTemplate() {
    const wallet = DataUtil.recentWallet()

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
    const { isStandalone } = OptionsCtrl.state
    const manualTemplate = this.manualWalletsTemplate()
    const recomendedTemplate = this.recomendedWalletsTemplate()
    const externalTemplate = this.externalWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()

    let templates = [recentTemplate, ...manualTemplate, ...recomendedTemplate]
    if (!isStandalone) {
      templates = [recentTemplate, ...externalTemplate, ...manualTemplate, ...recomendedTemplate]
    }
    templates.filter(Boolean)

    const isViewAll = templates.length > 8
    let wallets = []
    if (isViewAll) {
      wallets = templates.slice(0, 7)
    } else {
      wallets = templates
    }
    const row1 = wallets.slice(0, 4)
    const row2 = wallets.slice(4, 8)
    const isWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
      ></w3m-modal-header>

      ${isWallets
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
