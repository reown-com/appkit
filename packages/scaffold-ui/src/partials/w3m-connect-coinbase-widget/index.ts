import type { BaseError, Connector } from '@web3modal/core'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  StorageUtil
} from '@web3modal/core'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-coinbase-widget')
export class W3mConnectCoinbaseWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const coinbaseConnector = this.connectors.find(
      connector => connector.id === 'coinbaseWalletSDK'
    )

    if (!coinbaseConnector) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(coinbaseConnector))}
          .installed=${true}
          name=${ifDefined(coinbaseConnector.name)}
          data-testid=${`wallet-selector-${coinbaseConnector.id}`}
          @click=${() => this.onConnector(coinbaseConnector)}
        >
        </wui-list-wallet>
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  /**
   * Replicate of `onConnectProxy` method from `w3m-connecting-external-view` which is only used for Coinbase connector.
   */
  private async onCoinbaseConnector(connector: Connector) {
    try {
      ConnectionController.setWcError(false)

      if (connector.imageUrl) {
        StorageUtil.setConnectedWalletImageUrl(connector.imageUrl)
      }

      await ConnectionController.connectExternal(connector)

      if (OptionsController.state.isSiweEnabled) {
        RouterController.push('ConnectingSiwe')
      } else {
        ModalController.close()
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: { method: 'browser', name: connector.name || 'Unknown' }
      })
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as BaseError)?.message ?? 'Unknown' }
      })
      ConnectionController.setWcError(true)
    }
  }

  private onConnector(connector: Connector) {
    RouterController.push('ConnectingExternal', { connector })

    if (connector.id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
      this.onCoinbaseConnector(connector)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-coinbase-widget': W3mConnectCoinbaseWidget
  }
}
