import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { type ChainNamespace, ConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  ApiController,
  AssetUtil,
  ChainController,
  type Connector,
  ConnectorController,
  type ConnectorType,
  type ConnectorWithProviders,
  type CustomWallet,
  OptionsController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-controllers'
import { type TagVariant, customElement } from '@reown/appkit-ui'
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
import { WalletUtil } from '../../utils/WalletUtil.js'
import styles from './styles.js'

type ConnectorItem = {
  icon: string | undefined
  name: string
  tag?: {
    variant?: TagVariant
    label?: string
  }
  type: ConnectorType | 'EXPLORER'
  explorerWallet?: WcWallet
  supportedNamespaces: ChainNamespace[]
}

@customElement('w3m-connector-list')
export class W3mConnectorList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private recommended = ApiController.state.recommended

  @state() private featured = ApiController.state.featured

  @state() private wallets: WcWallet[] = []

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ApiController.subscribeKey('recommended', val => (this.recommended = val)),
      ApiController.subscribeKey('featured', val => (this.featured = val))
    )
  }

  public override async connectedCallback() {
    super.connectedCallback()

    const params = {
      page: 1,
      entries: 20,
      badge: 'certified' as const,
      names: '',
      rdns: ''
    }

    // Use RDNS for EIP155 chains
    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM) {
      const rdns = this.connectors
        .flatMap(c => c.connectors?.map(c => c.info?.rdns) || [])
        .concat(this.connectors.map(c => c.info?.rdns) || [])
        .filter(Boolean)
      params.rdns = rdns.join(',')
    }

    params.names = this.connectors.map(connector => connector.name).join(',')

    const { data } = await ApiController.fetchWallets(params)
    this.wallets = data
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
  private mapConnectorsToExplorerWallets(connectors: Connector[], explorerWallets: WcWallet[]) {
    return connectors.map(connector => {
      if (connector.type === 'MULTI_CHAIN' && connector.connectors) {
        const connectorIds = connector.connectors.map(c => c.id)
        const connectorNames = connector.connectors.map(c => c.name)
        const connectorRdns = connector.connectors.map(c => c.info?.rdns)

        const explorerWallet = explorerWallets.find(
          wallet =>
            connectorIds.includes(wallet.id) ||
            connectorNames.includes(wallet.name) ||
            (wallet.rdns &&
              (connectorRdns.includes(wallet.rdns) || connectorIds.includes(wallet.rdns)))
        )

        connector.explorerWallet = explorerWallet

        return connector
      }

      const explorerWallet = explorerWallets.find(
        wallet =>
          wallet.id === connector.id ||
          wallet.rdns === connector.info?.rdns ||
          wallet.name === connector.name
      )

      connector.explorerWallet = explorerWallet

      return connector
    })
  }

  private formatWallet(wallet: WcWallet): ConnectorItem & WcWallet {
    return {
      ...wallet,
      type: 'EXPLORER',
      explorerWallet: wallet,
      icon: AssetUtil.getWalletImage(wallet),
      supportedNamespaces:
        wallet.chains?.map(chain => ParseUtil.parseCaipNetworkId(chain).chainNamespace) ||
        ([ChainController.state.activeChain] as ChainNamespace[])
    }
  }

  private formatConnector(
    connector: ConnectorWithProviders
  ): ConnectorItem & ConnectorWithProviders {
    return {
      ...connector,
      icon: AssetUtil.getConnectorImage(connector),
      supportedNamespaces: connector.connectors?.map(c => c.chain) || [connector.chain],
      tag: {
        variant: connector.type === 'EXTERNAL' ? undefined : 'success',
        label: connector.type === 'EXTERNAL' ? undefined : 'installed'
      }
    }
  }

  private sortByConnectorTypeOrder(params: {
    featured: ConnectorItem[]
    external: ConnectorItem[]
    custom: ConnectorItem[]
  }) {
    const order = ConnectorUtil.getConnectorTypeOrder({
      featured: params.featured.map(f => f.explorerWallet as WcWallet),
      custom: params.custom.map(c => c.explorerWallet as CustomWallet),
      external: params.external.map(e => e.explorerWallet as WcWallet)
    }) as (keyof typeof params)[]

    return order.map(type => params[type])
  }

  private sortConnectors(connectors: ConnectorWithProviders[]): ConnectorItem[] {
    /*
     * WC
     * Top wallet from ranking
     * recent if present - top wallet
     * installed if present - top wallet
     * featured if present - top wallet as per connectorTypeOrder
     * external if present - top wallet from ranking as per connectorTypeOrder
     * custom if present - top wallet from ranking as per connectorTypeOrder
     * recommended if present - top wallet from ranking as per connectorTypeOrder if there are not enough wallets to fill the list
     */

    const custom = OptionsController.state.customWallets || []
    const recent = StorageUtil.getRecentWallets()
    const formattedConnectors = connectors.map(this.formatConnector)
    const formattedWallets = WalletUtil.filterOutDuplicateWallets(this.recommended)
      .concat(WalletUtil.filterOutDuplicateWallets(this.featured))
      .concat(custom)
      .concat(recent)
      .map(this.formatWallet)

    const topWallet = formattedWallets.sort((a, b) => (b.order ?? 0) - (a.order ?? 0))[0]
    const authConnector = formattedConnectors.find(
      connector =>
        connector.type === 'AUTH' ||
        (connector.type === 'MULTI_CHAIN' && connector.connectors?.some(c => c.type === 'AUTH'))
    )
    const installed = formattedConnectors.filter(
      connector =>
        (topWallet && connector.explorerWallet?.id !== topWallet?.id) ||
        connector.type === 'ANNOUNCED' ||
        connector.type === 'INJECTED' ||
        connector.type === 'MULTI_CHAIN'
    )
    const external = formattedConnectors.filter(connector => connector.type === 'EXTERNAL')
    const featured = formattedWallets.filter(wallet => this.featured.some(f => f.id === wallet.id))
    const formattedCustom = custom.map(c => this.formatWallet(c))
    const others = this.sortByConnectorTypeOrder({ featured, external, custom: formattedCustom })

    const renederedConenctorAmount =
      installed.length +
      others.length +
      recent.length +
      (authConnector ? 1 : 0) +
      (topWallet ? 1 : 0)

    const recommended = formattedWallets
      .filter(wallet => this.recommended.some(r => r.id === wallet.id))
      .slice(0, 5 - renederedConenctorAmount)

    return [topWallet, ...recent, ...installed, ...others, ...recommended].filter(
      Boolean
    ) as ConnectorItem[]
  }

  private connectorListTemplate() {
    const connectors = this.mapConnectorsToExplorerWallets(this.connectors, this.wallets)
    const sortedConnectors = this.sortConnectors(connectors)

    return html`
      ${sortedConnectors.map(
        connector =>
          html`<wui-flex flexDirection="column" gap="2">
            <w3m-connector-item connector=${connector}></w3m-connector-item>
          </wui-flex>`
      )}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-list': W3mConnectorList
  }
}
