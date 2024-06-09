import type { Connector } from '@web3modal/core'
import { AssetUtil, ConnectorController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-external-widget')
export class W3mConnectExternalWidget extends LitElement {
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
    const externalConnectors = this.connectors.filter(
      connector => !['WALLET_CONNECT', 'INJECTED', 'ANNOUNCED', 'AUTH'].includes(connector.type)
    )

    if (!externalConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }
    this.style.cssText = `display: block`
    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${externalConnectors.map(
          connector => html`
            <wui-list-wallet
              imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
              name=${connector.name ?? 'Unknown'}
              @click=${() => this.onConnector(connector)}
            >
            </wui-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    RouterController.push('ConnectingExternal', { connector })
  }
}
