import { CoreHelpers, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-search-input'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import { getCustomWallets, handleMobileLinking } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

interface PlatformData {
  name: string
  universal?: string
  deep?: string
  walletId: string
}

@customElement('w3m-wallet-filter-view')
export class W3mWalletFilterView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private search = ''

  // -- private ------------------------------------------------------ //
  private async onConnectPlatform({ name, universal, deep, walletId }: PlatformData) {
    if (CoreHelpers.isMobile()) {
      await handleMobileLinking({ deep, universal }, name)
    } else {
      RouterCtrl.push('DesktopConnector', {
        DesktopConnector: { name, walletId, universal, deeplink: deep }
      })
    }
  }

  private onSearchChange(event: Event) {
    const { value } = event.target as HTMLInputElement
    this.search = value
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const wallets = getCustomWallets()
    const filtered = this.search.length
      ? wallets.filter(wallet => wallet.name.toUpperCase().includes(this.search.toUpperCase()))
      : wallets

    return html`
      ${dynamicStyles()}

      <w3m-modal-header>
        <w3m-search-input .onChange=${this.onSearchChange.bind(this)}></w3m-search-input>
      </w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-content">
          ${filtered.map(
            ({ id, name, links: { deep, universal } }) => html`
              <w3m-wallet-button
                walletId=${id}
                name=${name}
                .onClick=${async () =>
                  this.onConnectPlatform({ name, universal, deep, walletId: id })}
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
