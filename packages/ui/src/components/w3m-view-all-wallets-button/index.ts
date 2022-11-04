import { ExplorerCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { global } from '../../utils/Theme'
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
    const wallets = ExplorerCtrl.state.previewWallets.reverse().slice(0, 4)

    return html`
      ${dynamicStyles()}

      <button class="w3m-button" @click=${this.onClick}>
        <div class="w3m-icons">
          ${wallets.map(wallet => html`<img src=${wallet.image_url.lg} />`)}
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
