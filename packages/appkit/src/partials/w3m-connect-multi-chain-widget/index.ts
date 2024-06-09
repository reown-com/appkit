import type { Connector } from '@web3modal/core'
import { AssetUtil, ConnectorController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-multi-chain-widget')
export class W3mConnectMultiChainWidget extends LitElement {
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
    const uniqueConnectorsMap: Record<string, Connector[]> = {}
    const multiChainConnectors: Partial<Connector>[] = []

    this.connectors.forEach(connector => {
      const name = connector.name ?? 'Unknown'
      if (uniqueConnectorsMap[name]) {
        uniqueConnectorsMap[name]?.push(connector)
      } else {
        uniqueConnectorsMap[name] = [connector]
      }
    })

    Object.keys(uniqueConnectorsMap).forEach(key => {
      const connectors = uniqueConnectorsMap[key]
      if (connectors && connectors.length > 1) {
        if (key === 'Phantom') {
          multiChainConnectors.push({
            name: key,
            imageUrl: connectors[0]?.imageUrl || connectors[1]?.imageUrl,
            imageId: connectors[0]?.imageId || connectors[1]?.imageId
          })
        }
      }
    })

    if (!multiChainConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    this.style.cssText = `display: block`

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${multiChainConnectors.map(
          connector => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector as Connector))}
              name=${connector.name ?? 'Unknown'}
              @click=${() => this.onMultiChainConnector('Phantom')}
              tagVariant="shade"
              tagLabel="multi-chain"
              data-testid=${`wallet-selector-${connector.id}`}
              .installed=${true}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onMultiChainConnector(connectorName: string) {
    RouterController.push('SelectChain', { chainSelectConnectorName: connectorName })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-multi-chain-widget': W3mConnectMultiChainWidget
  }
}
