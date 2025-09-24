import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ApiController, ConnectorController } from '@reown/appkit-controllers'
import type { Connector, ConnectorWithProviders, WcWallet } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-connect-announced-widget/index.js'
import '../../partials/w3m-connect-custom-widget/index.js'
import '../../partials/w3m-connect-external-widget/index.js'
import '../../partials/w3m-connect-featured-widget/index.js'
import '../../partials/w3m-connect-injected-widget/index.js'
import '../../partials/w3m-connect-multi-chain-widget/index.js'
import '../../partials/w3m-connect-recent-widget/index.js'
import '../../partials/w3m-connect-recommended-widget/index.js'
import '../../partials/w3m-connect-walletconnect-widget/index.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import styles from './styles.js'

@customElement('w3m-connector-list')
export class W3mConnectorList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public tabIdx?: number

  @state() private connectors = ConnectorController.state.connectors

  @state() private recommended = ApiController.state.recommended

  @state() private featured = ApiController.state.featured

  @state() private explorerWallets?: WcWallet[] = ApiController.state.explorerWallets

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ApiController.subscribeKey('recommended', val => (this.recommended = val)),
      ApiController.subscribeKey('featured', val => (this.featured = val)),
      // Consume explorer wallets for ranking only
      ApiController.subscribeKey('explorerFilteredWallets', val => {
        this.explorerWallets = val?.length ? val : ApiController.state.explorerWallets
      }),
      ApiController.subscribeKey('explorerWallets', val => {
        if (!this.explorerWallets?.length) {
          this.explorerWallets = val
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `
  }

  // -- Private ------------------------------------------ //
  private mapConnectorsToExplorerWallets(
    connectors: ConnectorWithProviders[],
    explorerWallets: WcWallet[]
  ): ConnectorWithProviders[] {
    return connectors.map(connector => {
      if (connector.type === 'MULTI_CHAIN' && connector.connectors) {
        const connectorIds = connector.connectors.map(c => c.id)
        const connectorNames = connector.connectors.map(c => c.name)
        const connectorRdns = connector.connectors.map(c => c.info?.rdns)

        const explorerWallet = explorerWallets?.find(
          wallet =>
            connectorIds.includes(wallet.id) ||
            connectorNames.includes(wallet.name) ||
            (wallet.rdns &&
              (connectorRdns.includes(wallet.rdns) || connectorIds.includes(wallet.rdns)))
        )

        connector.explorerWallet = explorerWallet ?? connector.explorerWallet

        return connector
      }

      const explorerWallet = explorerWallets?.find(
        wallet =>
          wallet.id === connector.id ||
          wallet.rdns === connector.info?.rdns ||
          wallet.name === connector.name
      )

      connector.explorerWallet = explorerWallet ?? connector.explorerWallet

      return connector
    })
  }

  private processConnectorsByType(
    connectors: ConnectorWithProviders[],
    shouldFilter = true
  ): ConnectorWithProviders[] {
    if (!this.explorerWallets?.length) {
      return connectors
    }

    const sorted = ConnectorUtil.sortConnectorsByExplorerWallet([...connectors])

    return shouldFilter ? sorted.filter(ConnectorUtil.showConnector) : sorted
  }

  private connectorListTemplate() {
    const mappedConnectors: ConnectorWithProviders[] = this.mapConnectorsToExplorerWallets(
      this.connectors,
      this.explorerWallets ?? []
    )

    const byType = ConnectorUtil.getConnectorsByType(
      mappedConnectors,
      this.recommended,
      this.featured
    )

    const announced = this.processConnectorsByType(byType.announced)
    const injected = this.processConnectorsByType(byType.injected)
    const multiChain = this.processConnectorsByType(byType.multiChain, false)
    const custom = byType.custom
    const recent = byType.recent
    const external = byType.external
    const recommended = byType.recommended
    const featured = byType.featured

    const connectorTypeOrder = ConnectorUtil.getConnectorTypeOrder({
      custom,
      recent,
      announced,
      injected,
      multiChain,
      recommended,
      featured,
      external
    })

    return connectorTypeOrder.map(type => {
      switch (type) {
        /*
         * We merged injected, announced, and multi-chain connectors
         * into a single connector type (injected) to reduce confusion
         */
        case 'injected':
          return html`
            ${multiChain.length
              ? html`<w3m-connect-multi-chain-widget
                  tabIdx=${ifDefined(this.tabIdx)}
                  .connectors=${multiChain}
                ></w3m-connect-multi-chain-widget>`
              : null}
            ${announced.length
              ? html`<w3m-connect-announced-widget
                  tabIdx=${ifDefined(this.tabIdx)}
                  .connectors=${announced as Connector[]}
                ></w3m-connect-announced-widget>`
              : null}
            ${injected.length
              ? html`<w3m-connect-injected-widget
                  .connectors=${injected}
                  tabIdx=${ifDefined(this.tabIdx)}
                ></w3m-connect-injected-widget>`
              : null}
          `

        case 'walletConnect':
          return html`<w3m-connect-walletconnect-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`

        case 'recent':
          return html`<w3m-connect-recent-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-recent-widget>`

        case 'featured':
          return html`<w3m-connect-featured-widget
            .wallets=${featured}
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-featured-widget>`

        case 'custom':
          return html`<w3m-connect-custom-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-custom-widget>`

        case 'external':
          return html`<w3m-connect-external-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-external-widget>`

        case 'recommended':
          return html`<w3m-connect-recommended-widget
            .wallets=${recommended}
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-recommended-widget>`

        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown connector type: ${type}`)

          return null
      }
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-list': W3mConnectorList
  }
}
