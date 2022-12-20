import type { DesktopConnectorData } from '@web3modal/core'
import { CoreUtil, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-wallet-filter-view')
export class W3mWalletFilterView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private search = ''

  // -- private ------------------------------------------------------ //
  private async onConnectPlatform({ name, universal, native, walletId }: DesktopConnectorData) {
    if (CoreUtil.isMobile()) {
      await UiUtil.handleMobileLinking({ links: { native, universal }, name, id: walletId })
    } else {
      RouterCtrl.push('DesktopConnector', {
        DesktopConnector: { name, walletId, universal, native }
      })
    }
  }

  private onSearchChange(event: Event) {
    const { value } = event.target as HTMLInputElement
    this.search = value
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = UiUtil.getCustomWallets()
    const filtered = this.search.length
      ? wallets.filter(wallet => UiUtil.caseSafeIncludes(wallet.name, this.search))
      : wallets

    return html`
      <w3m-modal-header>
        <w3m-search-input .onChange=${this.onSearchChange.bind(this)}></w3m-search-input>
      </w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-grid">
          ${filtered.map(
            ({ id, name, links: { native, universal } }) => html`
              <w3m-wallet-button
                walletId=${id}
                name=${name}
                .onClick=${async () =>
                  this.onConnectPlatform({ name, universal, native, walletId: id })}
              >
              </w3m-wallet-button>
            `
          )}
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-filter-view': W3mWalletFilterView
  }
}
