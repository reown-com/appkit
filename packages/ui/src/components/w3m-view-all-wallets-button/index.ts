import { ExplorerCtrl, ConfigCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-text'
import { scss } from '../../style/utils'
import { global, color } from '../../utils/Theme'
import styles from './styles.css'

@customElement('w3m-view-all-wallets-button')
export class W3mViewAllWalletsButton extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- render ------------------------------------------------------- //
  private onClick() {
    RouterCtrl.push('WalletExplorer')
  }

  protected dynamicStyles() {
    const { background, overlay } = color()
    const isDark = ConfigCtrl.state.theme === 'dark'

    return html`
      <style>
        .w3m-icons {
          background-color: ${background.accent};
          box-shadow: inset 0 0 0 1px ${overlay.thin};
        }

        .w3m-button:hover .w3m-icons {
          filter: brightness(${isDark ? '110%' : '104%'});
        }

        .w3m-icons img {
          border: 1px solid ${overlay.thin};
        }
      </style>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = ExplorerCtrl.state.previewWallets.reverse().slice(0, 4)

    return html`
      ${this.dynamicStyles()}

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
