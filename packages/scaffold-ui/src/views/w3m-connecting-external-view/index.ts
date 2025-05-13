import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { BaseError, Connection, Connector } from '@reown/appkit-controllers'
import {
  ChainController,
  ConnectionController,
  EventsController,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectionUtil } from '../../utils/ConnectionUtil.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends W3mConnectingWidget {
  // -- Members ------------------------------------------- //
  private externalViewUnsubscribe: (() => void)[] = []

  private connections = this.connector
    ? (ConnectionController.state.connections.get(this.connector?.chain) ?? [])
    : []

  public constructor() {
    super()
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    if (this.isAlreadyConnected(this.connector)) {
      this.secondaryBtnLabel = undefined
      this.label = `Wallet is already linked, switch wallet in ${this.connector.name}`
      this.secondaryLabel = `To link a new wallet, open ${this.connector.name} and switch to the account you want to link.`
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.connector.name ?? 'Unknown',
        platform: 'browser'
      }
    })
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    this.isWalletConnect = false
    this.externalViewUnsubscribe.push(
      ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          ModalController.close()
        }
      }),
      ConnectionController.subscribeKey('connections', this.onConnectionsChange.bind(this))
    )
  }

  public override disconnectedCallback() {
    this.externalViewUnsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      if (this.connector) {
        // No need to connect again if already connected
        if (this.isAlreadyConnected(this.connector)) {
          return
        }

        /**
         * Coinbase SDK works with popups and popups requires user interaction to be opened since modern browsers block popups which triggered programmatically.
         * Instead of opening a popup in first render for `W3mConnectingWidget`, we need to trigger connection for Coinbase connector specifically when users select it.
         * And if there is an error, this condition will be skipped and the connection will be triggered as usual because we have `Try again` button in this view which is a user interaction as well.
         */
        if (this.connector.id !== CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK || !this.error) {
          await ConnectionController.connectExternal(this.connector, this.connector.chain)

          EventsController.sendEvent({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: { method: 'browser', name: this.connector.name || 'Unknown' }
          })
        }
      }
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as BaseError)?.message ?? 'Unknown' }
      })
      this.error = true
    }
  }

  private onConnectionsChange(connections: Map<ChainNamespace, Connection[]>) {
    if (
      this.connector?.chain &&
      connections.get(this.connector.chain) &&
      this.isAlreadyConnected(this.connector)
    ) {
      const newConnections = connections.get(this.connector.chain) ?? []

      if (newConnections.length === 0) {
        RouterController.replace('Connect')
      } else {
        const allCurrentAccountsByConnectorId = ConnectionUtil.getConnectionsByConnectorId(
          this.connections,
          this.connector.id
        ).flatMap(c => c.accounts)

        const allNewAccountsByConnectorId = ConnectionUtil.getConnectionsByConnectorId(
          newConnections,
          this.connector.id
        ).flatMap(c => c.accounts)

        const isEveryAccountSame = allCurrentAccountsByConnectorId.every(a =>
          allNewAccountsByConnectorId.some(b => HelpersUtil.isLowerCaseMatch(a.address, b.address))
        )

        if (!isEveryAccountSame) {
          RouterController.replace('Account')
          RouterController.push('ProfileWallets')
        }
      }
    }
  }

  private isAlreadyConnected(connector: Connector) {
    if (connector) {
      return this.connections.some(c => HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id))
    }

    return false
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-external-view': W3mConnectingExternalView
  }
}
