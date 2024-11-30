import type { Connector } from '@reown/appkit-core'
import {
  ApiController,
  AssetUtil,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-announced-widget')
export class W3mConnectAnnouncedWidget extends LitElement {
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
    const announcedConnectors = this.connectors.filter(connector => connector.type === 'ANNOUNCED')

    if (!announcedConnectors?.length) {
      this.style.cssText = `display: none`

      return null
    }

    return html`
      ${announcedConnectors.map(connector => {
        if (connector.info?.rdns && ApiController.state.excludedRDNS) {
          if (ApiController.state.excludedRDNS.includes(connector?.info?.rdns)) {
            return null
          }
        }

        return html`
          <wui-list-select-wallet
            imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
            name=${connector.name ?? 'Unknown'}
            tagLabel="INSTALLED"
            tagVariant="success"
            variant="primary"
            @click=${() => this.onConnector(connector)}
            data-testid=${`wallet-selector-${connector.id}`}
          ></wui-list-select-wallet>
        `
      })}
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    if (connector.id === 'walletConnect') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect')
      }
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-announced-widget': W3mConnectAnnouncedWidget
  }
}
