import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { InjectedId } from '../../presets/EthereumPresets'
import { DataFilterUtil } from '../../utils/DataFilterUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import { styles } from './styles.css'

@customElement('w3m-connectors-view')
export class W3mConnectorsView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private async onConnectorWallet(id: string) {
    await UiUtil.handleConnectorConnection(id)
  }

  private connectorWalletsTemplate() {
    let wallets = DataFilterUtil.connectorWallets()

    if (!window.ethereum) {
      wallets = wallets.filter(({ id }) => id !== 'injected' && id !== InjectedId.metaMask)
    }

    return wallets.map(
      ({ name, id, ready }) => html`
        <w3m-wallet-button
          .installed=${['injected', 'metaMask'].includes(id) && ready}
          name=${name}
          walletId=${id}
          .onClick=${async () => this.onConnectorWallet(id)}
        ></w3m-wallet-button>
      `
    )
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const connectors = this.connectorWalletsTemplate()

    return html`
      <w3m-modal-header title="Other wallets"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-grid">${connectors}</div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connectors-view': W3mConnectorsView
  }
}
