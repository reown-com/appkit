import { ConfigCtrl, ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { getOptimisticWalletIdPreset } from '../../utils/Presets'
import { global } from '../../utils/Theme'
import { getWalletIcon } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-view-all-wallets-button')
export class W3mViewAllWalletsButton extends LitElement {
  public static styles = [global, styles]

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
    const { desktopWallets, mobileWallets } = ConfigCtrl.state
    const { previewWallets } = ExplorerCtrl.state
    const customWallets = desktopWallets ?? mobileWallets ?? []
    const rePreviewWallets = [...previewWallets].reverse().slice(0, 4)
    const reCustomWallets = [...customWallets].reverse().slice(0, 4)
    const isPreviewWallets = Boolean(rePreviewWallets.length)
    const isCustomWallets = Boolean(reCustomWallets.length)

    return html`
      ${dynamicStyles()}

      <button class="w3m-button" @click=${() => this.onClick(isPreviewWallets, isCustomWallets)}>
        <div class="w3m-icons">
          ${isPreviewWallets
            ? rePreviewWallets.map(wallet => html`<img src=${wallet.image_url.lg} />`)
            : null}
          ${isCustomWallets
            ? reCustomWallets.map(wallet => {
                const optimisticId = getOptimisticWalletIdPreset(wallet.id)

                return html`<img src=${getWalletIcon(optimisticId)} />`
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
