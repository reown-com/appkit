import {
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ErrorUtil
} from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'
import type { BaseError, Connector } from '@reown/appkit-controllers'
import {
  AppKitError,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import { HelpersUtil } from '@reown/appkit-utils'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends W3mConnectingWidget {
  // -- Members ------------------------------------------- //
  private externalViewUnsubscribe: (() => void)[] = []
  private connectionsByNamespace = ConnectionController.getConnections(this.connector?.chain)
  private hasMultipleConnections = this.connectionsByNamespace.length > 0
  private remoteFeatures = OptionsController.state.remoteFeatures
  private currentActiveConnectorId =
    ConnectorController.state.activeConnectorIds[this.connector?.chain as ChainNamespace]

  public constructor() {
    super()

    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    const namespace = this.connector?.chain as ChainNamespace

    if (this.isAlreadyConnected(this.connector)) {
      this.secondaryBtnLabel = undefined
      this.label = `This account is already linked, change your account in ${this.connector.name}`
      this.secondaryLabel = `To link a new account, open ${this.connector.name} and switch to the account you want to link`
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.connector.name ?? 'Unknown',
        platform: 'browser',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet?.order,
        view: RouterController.state.view
      }
    })
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    this.isWalletConnect = false
    this.externalViewUnsubscribe.push(
      ConnectorController.subscribeKey('activeConnectorIds', val => {
        const newActiveConnectorId = val[namespace]
        const isMultiWalletEnabled = this.remoteFeatures?.multiWallet
        const { redirectView } = RouterController.state.data ?? {}

        if (newActiveConnectorId !== this.currentActiveConnectorId) {
          if (this.hasMultipleConnections && isMultiWalletEnabled) {
            RouterController.replace('ProfileWallets')
            SnackController.showSuccess('New Wallet Added')
          } else if (redirectView) {
            RouterController.replace(redirectView)
          } else {
            ModalController.close()
          }
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
            properties: {
              method: 'browser',
              name: this.connector.name || 'Unknown',
              view: RouterController.state.view,
              walletRank: this.wallet?.order
            }
          })
        }
      }
    } catch (error) {
      const isUserRejectedRequestError =
        error instanceof AppKitError &&
        error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST

      if (isUserRejectedRequestError) {
        EventsController.sendEvent({
          type: 'track',
          event: 'USER_REJECTED',
          properties: { message: error.message }
        })
      } else {
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_ERROR',
          properties: { message: (error as BaseError)?.message ?? 'Unknown' }
        })
      }

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
      const isMultiWalletEnabled = this.remoteFeatures?.multiWallet

      if (newConnections.length === 0) {
        RouterController.replace('Connect')
      } else {
        const accounts = ConnectionControllerUtil.getConnectionsByConnectorId(
          this.connectionsByNamespace,
          this.connector.id
        ).flatMap(c => c.accounts)

        const newAccounts = ConnectionControllerUtil.getConnectionsByConnectorId(
          newConnections,
          this.connector.id
        ).flatMap(c => c.accounts)

        if (newAccounts.length === 0) {
          if (this.hasMultipleConnections && isMultiWalletEnabled) {
            RouterController.replace('ProfileWallets')
            SnackController.showSuccess('Wallet deleted')
          } else {
            ModalController.close()
          }
        } else {
          const isAllAccountsSame = accounts.every(a =>
            newAccounts.some(b => HelpersUtil.isLowerCaseMatch(a.address, b.address))
          )

          if (!isAllAccountsSame && isMultiWalletEnabled) {
            RouterController.replace('ProfileWallets')
          }
        }
      }
    }
  }

  private isAlreadyConnected(connector: Connector) {
    return (
      Boolean(connector) &&
      this.connectionsByNamespace.some(c =>
        HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)
      )
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-external-view': W3mConnectingExternalView
  }
}
