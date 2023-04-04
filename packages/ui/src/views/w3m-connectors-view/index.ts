import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataUtil } from '../../utils/DataUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import { styles } from './styles.css'

@customElement('w3m-connectors-view')
export class W3mConnectorsView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onExternal(id: string) {
    UiUtil.handleConnectorConnection(id)
  }

  private externalWalletsTemplate() {
    const wallets = DataUtil.externalWallets()

    return wallets.map(
      wallet => html`
        <w3m-wallet-button
          name=${wallet.name}
          walletId=${wallet.id}
          .onClick=${() => this.onExternal(wallet.id)}
        ></w3m-wallet-button>
      `
    )
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const template = this.externalWalletsTemplate()

    return html`
      <w3m-modal-header title="Other wallets"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-grid">${template}</div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connectors-view': W3mConnectorsView
  }
}
