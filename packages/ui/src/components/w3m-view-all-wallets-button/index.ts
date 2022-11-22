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
  private onClick() {
    RouterCtrl.push('WalletExplorer')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { desktopWallets, mobileWallets } = ConfigCtrl.state
    const { previewWallets } = ExplorerCtrl.state
    const customWallets = desktopWallets ?? mobileWallets ?? []
    const rePreviewWallets = [...previewWallets].reverse().slice(0, 4)
    const reCustomWallets = [...customWallets].reverse().slice(0, 4)

    return html`
      ${dynamicStyles()}

      <button class="w3m-button" @click=${this.onClick}>
        <div class="w3m-icons">
          ${rePreviewWallets.length
            ? rePreviewWallets.map(wallet => html`<img src=${wallet.image_url.lg} />`)
            : null}
          ${reCustomWallets.length
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
