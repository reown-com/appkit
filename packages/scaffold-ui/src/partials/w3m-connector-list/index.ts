import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  AssetController,
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  type ConnectorItemWithKind,
  ConnectorUtil,
  CoreHelperUtil,
  RouterController,
  type WalletItemWithKind,
  type WcWallet
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import { HelpersUtil } from '@reown/appkit-utils'

import styles from './styles.js'

@customElement('w3m-connector-list')
export class W3mConnectorList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public tabIdx?: number

  @state() private explorerWallets?: WcWallet[] = ApiController.state.explorerWallets

  @state() private connections = ConnectionController.state.connections

  @state() private connectorImages = AssetController.state.connectorImages

  @state() private loadingTelegram = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectionController.subscribeKey('connections', val => (this.connections = val)),
      AssetController.subscribeKey('connectorImages', val => (this.connectorImages = val)),
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

    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loadingTelegram = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loadingTelegram = !val))
      )
    }
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

  private connectorListTemplate() {
    return ConnectorUtil.connectorList().map((item, displayIndex) => {
      if (item.kind === 'connector') {
        return this.renderConnector(item, displayIndex)
      }

      return this.renderWallet(item, displayIndex)
    })
  }

  private getConnectorNamespaces(item: ConnectorItemWithKind) {
    if (item.subtype === 'walletConnect') {
      return []
    }

    if (item.subtype === 'multiChain') {
      return (item.connector.connectors?.map(c => c.chain) as ChainNamespace[]) || []
    }

    return [item.connector.chain] as ChainNamespace[]
  }

  private renderConnector(item: ConnectorItemWithKind, index: number) {
    const connector = item.connector
    const imageSrc =
      AssetUtil.getConnectorImage(connector) || this.connectorImages[connector?.imageId ?? '']
    const connectionsByNamespace = this.connections.get(connector.chain) ?? []
    const isAlreadyConnected = connectionsByNamespace.some(c =>
      HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)
    )

    let tagLabel: string | undefined = undefined
    let tagVariant: 'info' | 'success' | 'accent' | undefined = undefined

    if (item.subtype === 'walletConnect') {
      tagLabel = 'qr code'
      tagVariant = 'accent'
    } else if (item.subtype === 'injected' || item.subtype === 'announced') {
      tagLabel = isAlreadyConnected ? 'connected' : 'installed'
      tagVariant = isAlreadyConnected ? 'info' : 'success'
    } else {
      tagLabel = undefined
      tagVariant = undefined
    }

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
    const disabled =
      item.subtype === 'walletConnect' || item.subtype === 'external' ? hasWcConnection : false

    return html`
      <w3m-list-wallet
        displayIndex=${index}
        imageSrc=${ifDefined(imageSrc)}
        .installed=${true}
        name=${connector.name ?? 'Unknown'}
        .tagVariant=${tagVariant}
        tagLabel=${ifDefined(tagLabel)}
        data-testid=${`wallet-selector-${connector.id.toLowerCase()}`}
        size="sm"
        @click=${() => this.onClickConnector(item)}
        tabIdx=${ifDefined(this.tabIdx)}
        ?disabled=${disabled}
        rdnsId=${ifDefined(connector.explorerWallet?.rdns || undefined)}
        walletRank=${ifDefined(connector.explorerWallet?.order)}
        .namespaces=${this.getConnectorNamespaces(item)}
      >
      </w3m-list-wallet>
    `
  }

  private onClickConnector(item: ConnectorItemWithKind) {
    const redirectView = RouterController.state.data?.redirectView
    if (item.subtype === 'walletConnect') {
      ConnectorController.setActiveConnector(item.connector)
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect', { redirectView })
      }

      return
    }

    if (item.subtype === 'multiChain') {
      ConnectorController.setActiveConnector(item.connector)
      RouterController.push('ConnectingMultiChain', { redirectView })

      return
    }

    if (item.subtype === 'injected') {
      ConnectorController.setActiveConnector(item.connector)
      RouterController.push('ConnectingExternal', {
        connector: item.connector,
        redirectView,
        wallet: item.connector.explorerWallet
      })

      return
    }

    if (item.subtype === 'announced') {
      if (item.connector.id === 'walletConnect') {
        if (CoreHelperUtil.isMobile()) {
          RouterController.push('AllWallets')
        } else {
          RouterController.push('ConnectingWalletConnect', { redirectView })
        }

        return
      }

      RouterController.push('ConnectingExternal', {
        connector: item.connector,
        redirectView,
        wallet: item.connector.explorerWallet
      })

      return
    }

    RouterController.push('ConnectingExternal', {
      connector: item.connector,
      redirectView
    })
  }

  private renderWallet(item: WalletItemWithKind, index: number) {
    const wallet = item.wallet
    const imageSrc = AssetUtil.getWalletImage(wallet)
    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
    const disabled = hasWcConnection
    const loading = this.loadingTelegram

    const tagLabel = item.subtype === 'recent' ? 'recent' : undefined
    const tagVariant = item.subtype === 'recent' ? 'info' : undefined

    return html`
      <w3m-list-wallet
        displayIndex=${index}
        imageSrc=${ifDefined(imageSrc)}
        name=${wallet.name ?? 'Unknown'}
        @click=${() => this.onClickWallet(item)}
        size="sm"
        data-testid=${`wallet-selector-${wallet.id}`}
        tabIdx=${ifDefined(this.tabIdx)}
        ?loading=${loading}
        ?disabled=${disabled}
        rdnsId=${ifDefined(wallet.rdns || undefined)}
        walletRank=${ifDefined(wallet.order)}
        tagLabel=${ifDefined(tagLabel)}
        .tagVariant=${tagVariant}
      >
      </w3m-list-wallet>
    `
  }

  private onClickWallet(item: WalletItemWithKind) {
    const redirectView = RouterController.state.data?.redirectView
    const namespace = ChainController.state.activeChain

    if (item.subtype === 'featured') {
      ConnectorController.selectWalletConnector(item.wallet)

      return
    }

    if (item.subtype === 'recent') {
      if (this.loadingTelegram) {
        return
      }

      ConnectorController.selectWalletConnector(item.wallet)

      return
    }
    if (item.subtype === 'custom') {
      if (this.loadingTelegram) {
        return
      }

      RouterController.push('ConnectingWalletConnect', { wallet: item.wallet, redirectView })

      return
    }

    // Recommended wallet case
    if (this.loadingTelegram) {
      return
    }

    const connector = namespace
      ? ConnectorController.getConnector({ id: item.wallet.id, namespace })
      : undefined

    if (connector) {
      RouterController.push('ConnectingExternal', { connector, redirectView })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet: item.wallet, redirectView })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-list': W3mConnectorList
  }
}
