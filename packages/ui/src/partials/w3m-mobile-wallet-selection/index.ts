import {
  ClientCtrl,
  ConfigCtrl,
  ExplorerCtrl,
  ModalCtrl,
  OptionsCtrl,
  RouterCtrl
} from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { PresetUtil } from '../../utils/PresetUtil'
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
    const { selectedChainId } = OptionsCtrl.state
    if (id === 'coinbaseWallet') {
      await ClientCtrl.client().connectCoinbaseMobile(() => null, selectedChainId)
    } else {
      await ClientCtrl.client().connectConnector(id, selectedChainId)
    }

    ModalCtrl.close()
  }

  private mobileWalletsTemplate() {
    const { mobileWallets } = ConfigCtrl.state
    const wallets = [...(mobileWallets ?? [])]

    if (window.ethereum) {
      const injectedName = PresetUtil.optimisticName('injected')
      const idx = wallets.findIndex(({ name }) => PresetUtil.optimisticName(name) === injectedName)
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
            .onClick=${async () => UiUtil.handleMobileLinking({ native, universal }, name)}
          ></w3m-wallet-button>
        `
      )
    }

    return undefined
  }

  private previewWalletsTemplate() {
    const { previewWallets } = ExplorerCtrl.state
    const wallets = [...previewWallets]

    if (window.ethereum) {
      const injectedName = PresetUtil.optimisticName('injected')
      const idx = wallets.findIndex(({ name }) => PresetUtil.optimisticName(name) === injectedName)
      wallets.splice(idx, 1)
    }

    return wallets.map(
      ({ image_url, name, mobile: { native, universal } }) => html`
        <w3m-wallet-button
          name=${name}
          src=${image_url.lg}
          .onClick=${async () => UiUtil.handleMobileLinking({ native, universal }, name)}
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
    const wallets = [...connectorWallets]

    if (!window.ethereum) {
      const injectedIdx = wallets.findIndex(({ id }) => id === 'injected')
      if (injectedIdx > -1) {
        wallets.splice(injectedIdx, 1)
      }
      const metaMaskdIdx = wallets.findIndex(({ id }) => id === 'metaMask')
      if (metaMaskdIdx > -1) {
        wallets.splice(metaMaskdIdx, 1)
      }
    }

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

  // -- render ------------------------------------------------------- //
  protected render() {
    const { standaloneUri } = OptionsCtrl.state
    const connectorTemplate = this.connectorWalletsTemplate()
    const mobileTemplate = this.mobileWalletsTemplate()
    const previewTemplate = this.previewWalletsTemplate()
    const linkingWallets = mobileTemplate ?? previewTemplate
    const combinedWallets = [...connectorTemplate, ...linkingWallets]
    const displayWallets = standaloneUri ? linkingWallets : combinedWallets
    const isViewAll = displayWallets.length > 8
    const wallets = isViewAll ? displayWallets.slice(0, 7) : displayWallets
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
              <div class="w3m-view-row">${row1}</div>
              ${row2.length
                ? html`
                    <div class="w3m-view-row">
                      ${row2}
                      ${isViewAll
                        ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                        : null}
                    </div>
                  `
                : null}
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
