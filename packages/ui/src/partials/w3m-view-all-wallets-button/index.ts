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
  private onClick() {
    RouterCtrl.push('WalletExplorer')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { previewWallets } = ExplorerCtrl.state
    const customWallets = UiUtil.getCustomWallets()
    const reversedWallets = [...previewWallets, ...customWallets].reverse().slice(0, 4)

    return html`
      <button @click=${this.onClick}>
        <div class="w3m-icons">
          ${reversedWallets.map(wallet => {
            // @ts-expect-error Can exist
            const explorerImg = wallet.image_url?.lg
            if (explorerImg) {
              return html`<img src=${explorerImg} />`
            }
            const optimisticId = UiUtil.getWalletId(wallet.id)
            const src = UiUtil.getWalletIcon(optimisticId)

            return src ? html`<img src=${src} />` : SvgUtil.WALLET_PLACEHOLDER
          })}
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
