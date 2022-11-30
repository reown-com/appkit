import { ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { PresetUtil } from '../../utils/PresetUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { getCustomWallets, getWalletIcon } from '../../utils/UiHelpers'
import styles from './styles.css'

@customElement('w3m-view-all-wallets-button')
export class W3mViewAllWalletsButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- render ------------------------------------------------------- //
  private onClick(isPreviewWallets: boolean, isCustomWallets: boolean) {
    if (isPreviewWallets) {
      RouterCtrl.push('WalletExplorer')
    } else if (isCustomWallets) {
      RouterCtrl.push('WalletFilter')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { previewWallets } = ExplorerCtrl.state
    const customWallets = getCustomWallets()
    const rePreviewWallets = [...previewWallets].reverse().slice(0, 4)
    const reCustomWallets = [...customWallets].reverse().slice(0, 4)
    const isPreviewWallets = Boolean(rePreviewWallets.length)
    const isCustomWallets = Boolean(reCustomWallets.length)

    return html`
      <button class="w3m-button" @click=${() => this.onClick(isPreviewWallets, isCustomWallets)}>
        <div class="w3m-icons">
          ${isPreviewWallets
            ? rePreviewWallets.map(wallet => html`<img src=${wallet.image_url.lg} />`)
            : null}
          ${isCustomWallets
            ? reCustomWallets.map(wallet => {
                const optimisticId = PresetUtil.optimisticWalletId(wallet.id)
                const src = getWalletIcon(optimisticId)

                return src ? html`<img src=${src} />` : SvgUtil.WALLET_PLACEHOLDER
              })
            : null}
        </div>
        <w3m-text variant="xsmall-normal">View More</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-view-all-wallets-button': W3mViewAllWalletsButton
  }
}
