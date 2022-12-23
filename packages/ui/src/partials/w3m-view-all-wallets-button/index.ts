import { ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
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
    const customWallets = UiUtil.getCustomWallets()
    const rePreviewWallets = [...previewWallets].reverse().slice(0, 4)
    const reCustomWallets = [...customWallets].reverse().slice(0, 4)
    const isPreviewWallets = Boolean(rePreviewWallets.length)
    const isCustomWallets = Boolean(reCustomWallets.length)

    return html`
      <button @click=${() => this.onClick(isPreviewWallets, isCustomWallets)}>
        <div class="w3m-icons">
          ${isPreviewWallets
            ? rePreviewWallets.map(wallet => html`<img src=${wallet.image_url.lg} />`)
            : null}
          ${isCustomWallets
            ? reCustomWallets.map(wallet => {
                const optimisticId = UiUtil.getWalletId(wallet.id)
                const src = UiUtil.getWalletIcon(optimisticId)

                return src ? html`<img src=${src} />` : SvgUtil.WALLET_PLACEHOLDER
              })
            : null}
        </div>
        <w3m-text variant="xsmall-normal">View All</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-view-all-wallets-button': W3mViewAllWalletsButton
  }
}
