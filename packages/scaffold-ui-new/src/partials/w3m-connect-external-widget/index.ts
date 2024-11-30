import type { Connector } from '@reown/appkit-core'
import { AssetUtil, ConnectorController, RouterController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
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
    const externalConnectors = this.connectors.filter(connector => connector.type === 'EXTERNAL')

    if (!externalConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      ${externalConnectors.map(
        connector => html`
          <wui-list-select-wallet
            imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
            name=${connector.name ?? 'Unknown'}
            variant="primary"
            @click=${() => this.onConnector(connector)}
            data-testid=${`wallet-selector-${connector.id}`}
          ></wui-list-select-wallet>
        `
      )}
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    RouterController.push('ConnectingExternal', { connector })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-external-widget': W3mConnectExternalWidget
  }
}
