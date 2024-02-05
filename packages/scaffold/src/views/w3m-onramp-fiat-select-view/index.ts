import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  type Connector
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-onramp-fiat-select-view')
export class W3mOnrampFiatSelectView extends LitElement {
  public static override styles = styles

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
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs"> ${this.injectedTemplate()} </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private injectedTemplate() {
    return this.connectors.map(connector => {
      if (connector.type !== 'INJECTED') {
        return null
      }

      if (!ConnectionController.checkInstalled()) {
        return null
      }

      return html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
          .installed=${true}
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
        >
        </wui-list-wallet>
      `
    })
  }

  // -- Private Methods ----------------------------------- //
  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
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
    'w3m-onramp-fiat-select-view': W3mOnrampFiatSelectView
  }
}
