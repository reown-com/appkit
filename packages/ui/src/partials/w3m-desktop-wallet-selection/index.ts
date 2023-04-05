import type { WalletData } from '@web3modal/core'
import { OptionsCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataUtil } from '../../utils/DataUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onConnecting(data: WalletData) {
    UiUtil.goToConnectingView(data)
  }

  private onExternal(id: string) {
    UiUtil.handleConnectorConnection(id)
  }

  private manualWalletsTemplate() {
    const wallets = DataUtil.manualDesktopWallets()

    return wallets.map(
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
    const wallets = DataUtil.recomendedWallets()

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

  private externalWalletsTemplate() {
    const wallets = DataUtil.externalWallets()

    return wallets.map(
      ({ id, name }) => html`
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
        name=${wallet.name}
        walletId=${wallet.id}
        imageId=${wallet.image_id}
        .recent=${true}
        .onClick=${() => this.onConnecting(wallet)}
      ></w3m-wallet-button>
    `
  }

  private injectedWalletsTemplate() {
    const wallets = DataUtil.injectedWallets()

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
    const { isStandalone } = OptionsCtrl.state
    const manualTemplate = this.manualWalletsTemplate()
    const recomendedTemplate = this.recomendedWalletsTemplate()
    const externalTemplate = this.externalWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()
    const injectedWallets = this.injectedWalletsTemplate()

    let templates = [recentTemplate, ...manualTemplate, ...recomendedTemplate]
    if (!isStandalone) {
      templates = [
        ...injectedWallets,
        recentTemplate,
        ...externalTemplate,
        ...manualTemplate,
        ...recomendedTemplate
      ]
    }
    templates = templates.filter(Boolean)

    const isViewAll = templates.length > 4
    let wallets = []
    if (isViewAll) {
      wallets = templates.slice(0, 3)
    } else {
      wallets = templates
    }
    const isWallets = Boolean(wallets.length)

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

      ${isWallets
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
