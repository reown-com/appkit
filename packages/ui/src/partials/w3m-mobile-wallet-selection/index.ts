import { ClientCtrl, ConfigCtrl, ExplorerCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { InjectedId } from '../../presets/EthereumPresets'
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

  private async onConnectorWallet(id: string) {
    await UiUtil.handleCustomConnector(id)
  }

  private mobileWalletsTemplate() {
    const { mobileWallets } = ConfigCtrl.state
    const wallets = [...(mobileWallets ?? [])]

    if (window.ethereum) {
      const injectedName = UiUtil.getWalletName('')
      const idx = wallets.findIndex(({ name }) => UiUtil.getWalletName(name) === injectedName)
      if (idx > -1) {
        wallets.splice(idx, 1)
      }
    }

    if (wallets.length) {
      return wallets.map(
        ({ id, name, links: { universal, native } }) => html`
          <w3m-wallet-button
            name=${name}
            walletId=${id}
            .onClick=${async () =>
              UiUtil.handleMobileLinking({ links: { native, universal }, name, id })}
          ></w3m-wallet-button>
        `
      )
    }

    return undefined
  }

  private previewWalletsTemplate() {
    const { previewWallets } = ExplorerCtrl.state
    let wallets = [...previewWallets]

    if (window.ethereum) {
      const injectedName = UiUtil.getWalletName('')
      wallets = wallets.filter(({ name }) => UiUtil.getWalletName(name) !== injectedName)
    }

    return wallets.map(
      ({ image_url, name, mobile: { native, universal }, id }) => html`
        <w3m-wallet-button
          name=${name}
          src=${image_url.lg}
          .onClick=${async () =>
            UiUtil.handleMobileLinking({
              links: { native, universal },
              name,
              id,
              image: image_url.lg
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

    const connectorWallets = ClientCtrl.client().getConnectors()
    let wallets = [...connectorWallets]

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

    const { id, name, links, image } = wallet

    return html`
      <w3m-wallet-button
        .recent=${true}
        name=${name}
        walletId=${ifDefined(id)}
        src=${ifDefined(image)}
        .onClick=${async () => UiUtil.handleMobileLinking({ name, id, links, image })}
      ></w3m-wallet-button>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const connectorTemplate = this.connectorWalletsTemplate()
    const mobileTemplate = this.mobileWalletsTemplate()
    const previewTemplate = this.previewWalletsTemplate()
    const recentTemplate = this.recentWalletTemplate()
    const linkingWallets = mobileTemplate ?? previewTemplate
    let combinedWallets = [...connectorTemplate, ...linkingWallets]
    if (recentTemplate) {
      const recentWallet = UiUtil.getRecentWallet()
      combinedWallets = combinedWallets.filter(
        wallet => !wallet.values.includes(recentWallet?.name)
      )
      combinedWallets.splice(0, 0, recentTemplate)
    }
    const displayWallets = standaloneUri ? linkingWallets : combinedWallets
    const isViewAll = displayWallets.length > 8
    let wallets = []

    if (isViewAll) {
      const filtered = displayWallets.filter(
        wallet => !wallet.values.includes(InjectedId.coinbaseWallet)
      )
      wallets = filtered.slice(0, 7)
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
