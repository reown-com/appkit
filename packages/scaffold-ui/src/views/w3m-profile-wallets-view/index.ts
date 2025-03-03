import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { AccountController, ConnectionController, ModalController } from '@reown/appkit-core'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-certified-switch'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-search-bar'

import '../../partials/w3m-all-wallets-list/index.js'
import '../../partials/w3m-all-wallets-search/index.js'

@customElement('w3m-profile-wallets-view')
export class W3mProfileWalletsView extends LitElement {
  // -- State & Properties -------------------------------- //
  private unsubscribe: (() => void)[] = []

  @state() private connections = ConnectionController.state.connections

  @state() private address = AccountController.state.address

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ConnectionController.subscribeKey('connections', newConnections => {
          this.connections = newConnections
        }),
        AccountController.subscribeKey('address', newAddress => {
          this.address = newAddress
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 's', 's', 's']} gap="xs">
        <wui-text variant="paragraph-500" color="fg-100">Wallets</wui-text>
        ${this.connections.map(connection =>
          connection.accounts?.map(
            account => html`
              <wui-list-item>
                <wui-flex flexDirection="column" gap="xxs" alignItems="flex-start" flexGrow="1">
                  <wui-flex flexDirection="row" gap="sm" alignItems="center">
                    <wui-text variant="paragraph-500" color="fg-100">
                      ${UiHelperUtil.getTruncateString({
                        string: account.address,
                        charsStart: 6,
                        charsEnd: 4,
                        truncate: 'middle'
                      })}
                    </wui-text>
                    ${account.address === this.address
                      ? html`<wui-tag size="md" variant="success">Active</wui-tag>`
                      : null}
                  </wui-flex>
                  <wui-text variant="paragraph-small-500" color="fg-250">
                    ${connection.connector.name ||
                    UiHelperUtil.getTruncateString({
                      string: connection.connector.id,
                      charsStart: 6,
                      charsEnd: 6,
                      truncate: 'end'
                    })}
                  </wui-text>
                </wui-flex>
                ${account.address !== this.address
                  ? html`
                      <wui-button
                        variant="neutral"
                        @click=${() => this.setActiveConnection(connection, account.address)}
                      >
                        Switch
                      </wui-button>
                    `
                  : ''}
              </wui-list-item>
            `
          )
        )}
        <wui-button variant="secondary" @click=${this.handleAddWallet}>Add Wallet</wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private handleAddWallet() {
    ModalController.open({ view: 'Connect' })
  }

  private setActiveConnection(connection: any, address: string) {
    ConnectionController.switchAccount(connection, address)
    // ConnectionController.connectExternal(
    //   {
    //     id: connection.connector.id,
    //     type: connection.connector.type,
    //     provider: connection.connector.provider,
    //     chain: connection.chain
    //   },
    //   connection.chain,
    //   false
    // )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
