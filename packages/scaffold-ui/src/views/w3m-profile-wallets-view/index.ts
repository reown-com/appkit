import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  type Connection,
  ConnectionController,
  ConnectorController,
  ModalController
} from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-certified-switch'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-search-bar'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-all-wallets-list/index.js'
import '../../partials/w3m-all-wallets-search/index.js'
import styles from './style.js'

@customElement('w3m-profile-wallets-view')
export class W3mProfileWalletsView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  private unsubscribe: (() => void)[] = []

  @state() private connections = ConnectionController.state.connections

  @state() private address = AccountController.state.address

  @state() private activeConnectorId = ConnectorController.state.activeConnectorIds

  @state() private namespace = ChainController.state.activeChain

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
        }),
        ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
          this.activeConnectorId = newActiveConnectorIds
        }),
        ChainController.subscribeKey('activeChain', namespace => {
          this.namespace = namespace
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const namespace = this.namespace

    if (!namespace) {
      throw new Error('No active namespace found')
    }

    const connectionsByNamespace = this.connections.get(namespace) ?? []

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 's', 's', 's']} gap="xs">
        ${connectionsByNamespace.map(connection =>
          connection.accounts?.map(account => {
            const connector = ConnectorController.getConnectorById(connection.connectorId)
            const connectorImageUrl = connector?.imageUrl || connector?.info?.icon
            const namespaceConnector = this.activeConnectorId[namespace]
            const connected =
              ChainController.getAccountData(namespace)?.address &&
              namespaceConnector === connection.connectorId
            const isActive =
              account.address === this.address && namespaceConnector === connection.connectorId

            if (connector) {
              return html`
                <wui-flex class="wui-profile-wallet-item">
                  ${connectorImageUrl
                    ? html`<wui-avatar
                        imageSrc=${connectorImageUrl}
                        size="md"
                        alt=${connector.name}
                      ></wui-avatar>`
                    : null}
                  <wui-flex flexDirection="column" gap="xxs" alignItems="flex-start" flexGrow="1">
                    <wui-flex flexDirection="row" gap="m" alignItems="center">
                      <wui-text variant="paragraph-400" color="fg-100">
                        ${UiHelperUtil.getTruncateString({
                          string: account.address,
                          charsStart: 6,
                          charsEnd: 4,
                          truncate: 'middle'
                        })}
                      </wui-text>
                      ${isActive
                        ? html`<wui-tag size="md" variant="success">Active</wui-tag>`
                        : null}
                    </wui-flex>
                    <wui-text variant="small-500" color="fg-250">
                      ${connector.name ||
                      UiHelperUtil.getTruncateString({
                        string: connector.id,
                        charsStart: 6,
                        charsEnd: 6,
                        truncate: 'end'
                      })}
                    </wui-text>
                  </wui-flex>
                  ${connected
                    ? this.switchButtonTemplate(account.address, connection, namespace)
                    : this.connectButtonTemplate(connection, namespace)}
                </wui-flex>
              `
            }

            return null
          })
        )}
        <wui-button .fullWidth=${true} variant="main" @click=${this.handleAddWallet}
          >Add Wallet</wui-button
        >
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private connectButtonTemplate(connection: Connection, namespace: ChainNamespace) {
    return html`<wui-button
      variant="accent"
      size="md"
      @click=${() => this.reconnectWallet(connection.connectorId, namespace)}
    >
      Connect
    </wui-button>`
  }

  private switchButtonTemplate(address: string, connection: Connection, namespace: ChainNamespace) {
    const isActive =
      address === this.address && connection.connectorId === this.activeConnectorId[namespace]

    if (isActive) {
      return null
    }

    return html`
      <wui-button
        variant="accent"
        size="md"
        @click=${() => {
          ConnectionController.switchAccount({ connection, address, namespace })
        }}
      >
        Switch
      </wui-button>
    `
  }

  private handleAddWallet() {
    ModalController.open({ view: 'Connect' })
  }

  private async reconnectWallet(connectorId: string, namespace: ChainNamespace) {
    const connector = ConnectorController.getConnectorById(connectorId)

    if (!connector) {
      return
    }

    await ConnectionController.connectExternal(connector, namespace)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
