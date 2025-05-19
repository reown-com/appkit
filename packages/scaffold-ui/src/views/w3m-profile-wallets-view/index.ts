import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  type CaipAddress,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil
} from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  type Connection,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  type SocialProvider,
  StorageUtil
} from '@reown/appkit-controllers'
import { MathUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-active-profile-wallet-item'
import '@reown/appkit-ui/wui-balance'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-inactive-profile-wallet-item'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-text'
import { HelpersUtil } from '@reown/appkit-utils'

import { ConnectionUtil } from '../../utils/ConnectionUtil.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import styles from './styles.js'

// -- Types ------------------------------------------ //
type HandleSwitchWalletParams = {
  connection: Connection
  address: string
  forceReconnect?: boolean
}

type DisplayConnectionsParams = {
  connections: Connection[]
  includeSeparator?: boolean
  forceReconnectOnSwitch?: boolean
  isRecentConnections: boolean
}

// -- Constants ------------------------------------------ //
const CHARS_START = 4
const CHARS_END = 6

const ICON_BADGE_SIZE = {
  size: 'md',
  icon: 'lightbulb'
}

const ICONS = {
  eip155: 'ethereum-black',
  solana: 'solana-black',
  bip122: 'bitcoin-black'
} as Record<ChainNamespace, string>

const NAMESPACE_PROFILE_TABS = [
  { namespace: 'eip155', icon: ICONS['eip155'], label: 'EVM' },
  { namespace: 'solana', icon: ICONS['solana'], label: 'Solana' },
  { namespace: 'bip122', icon: ICONS['bip122'], label: 'Bitcoin' }
] as const

const TABS_WIDTH = {
  1: 320,
  2: 160,
  3: 106
} as const

@customElement('w3m-profile-wallets-view')
export class W3mProfileWalletsView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------ //
  private unsubscribe: (() => void)[] = []
  private resizeObserver?: ResizeObserver
  private unsubscribeChainListener: (() => void) | undefined = undefined

  // -- State & Properties -------------------------------- //
  @state() private currentTab = 0
  @state() private namespace = ChainController.state.activeChain
  @state() private namespaces = Array.from(ChainController.state.chains.keys())
  @state() private connections = ConnectionController.state.connections
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private smartAccountAddress: string | undefined = undefined
  @state() private profileName: string | null | undefined = undefined
  @state() private lastSelectedAddress = ''
  @state() private lastSelectedConnectorId = ''
  @state() private isSwitching = false
  @state() private isDisconnecting = false

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.currentTab = this.namespace ? this.namespaces.indexOf(this.namespace) : 0
    this.smartAccountAddress = AccountController.getSmartAccountAddress(this.namespace)
    this.profileName = ChainController.getAccountData(this.namespace)?.profileName
    this.caipAddress = ChainController.getAccountData(this.namespace)?.caipAddress
    this.unsubscribe.push(
      ...[
        ConnectionController.subscribeKey('connections', newConnections => {
          this.connections = newConnections
        }),
        ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
          this.activeConnectorIds = newActiveConnectorIds
        })
      ]
    )
    this.unsubscribeChainListener = ChainController.subscribeChainProp(
      'accountState',
      val => {
        this.caipAddress = val?.caipAddress
        this.profileName = val?.profileName
        this.smartAccountAddress = val?.smartAccountAddress
      },
      this.namespace
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.disconnect()
    this.removeScrollListener()
    this.unsubscribeChainListener?.()
  }

  public override firstUpdated() {
    this.initializeScrollHandling()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const} gap="l">
        ${this.tabsTemplate()} ${this.headerTemplate()} ${this.walletsTemplate()}
        ${this.addWalletTemplate()}
      </wui-flex>
    `
  }

  // -- Private -------------------------------- //
  private tabsTemplate() {
    const tabs = NAMESPACE_PROFILE_TABS.filter(tab =>
      this.namespaces.includes(tab.namespace as ChainNamespace)
    )

    const tabWidth = TABS_WIDTH[tabs.length as keyof typeof TABS_WIDTH] ?? TABS_WIDTH[1]

    return html`
      <wui-tabs
        .onTabChange=${this.onTabChange.bind(this)}
        .activeTab=${this.currentTab}
        localTabWidth=${`${tabWidth}px`}
        .tabs=${tabs}
      ></wui-tabs>
    `
  }

  private walletsTemplate() {
    return html`
      <wui-flex flexDirection="column" class="wallet-list" rowGap="s">
        ${this.emptyTemplate()} ${this.activeWalletsTemplate()} ${this.recentWalletsTemplate()}
      </wui-flex>
    `
  }

  private headerTemplate() {
    const { hasConnections, connections } = this.getConnectionsData()

    let totalConnections = connections.flatMap(({ accounts }) => accounts).length

    if (this.caipAddress) {
      totalConnections += 1
    }

    return html`
      <wui-flex alignItems="center" columnGap="3xs">
        <wui-icon name=${ICONS[this.namespace as ChainNamespace]} size="lg"></wui-icon>
        <wui-text color="fg-200" variant="small-400">
          Wallet${totalConnections > 1 ? 's' : ''}
        </wui-text>
        <wui-text color="fg-100" variant="small-400" class="balance-amount">
          ${totalConnections}
        </wui-text>
        ${hasConnections
          ? html`<wui-link
              color="fg-200"
              @click=${() => ChainController.disconnect(this.namespace, true)}
            >
              Disconnect All
            </wui-link>`
          : null}
      </wui-flex>
    `
  }

  private activeWalletsTemplate() {
    const { connections } = this.getConnectionsData()
    const { plainAddress } = this.getConnectedWalletData()

    if (connections.length === 0 || !plainAddress) {
      return null
    }

    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['l', 'l', 'xs', 'l'] as const}
        class="active-wallets"
      >
        ${this.connectedWalletTemplate()} ${this.connectionsTemplate()}
      </wui-flex>
    `
  }

  private connectedWalletTemplate() {
    if (!this.namespace) {
      return null
    }

    const connectorId = this.activeConnectorIds[this.namespace]

    if (!connectorId) {
      return null
    }

    let description: string | undefined = undefined

    const connector = ConnectorController.getConnectorById(connectorId)
    const connectorImage = AssetUtil.getConnectorImage(connector)

    const { plainAddress, shouldShowLineSeparator } = this.getConnectedWalletData()

    const { isAuth, icon, iconSize } = this.getAuthData(connectorId)

    const isSmartAccount = this.smartAccountAddress
      ? HelpersUtil.isLowerCaseMatch(this.smartAccountAddress, plainAddress)
      : false

    if (isAuth) {
      description = isSmartAccount ? 'Smart Account' : 'EOA Account'
    }

    return html`<wui-flex flexDirection="column">
      <wui-active-profile-wallet-item
        address=${plainAddress}
        alt=${connector?.name}
        tagLabel="Active"
        tagVariant="success"
        .description=${description}
        .profileName=${this.profileName}
        .loading=${this.isDisconnecting}
        .charsStart=${CHARS_START}
        .charsEnd=${CHARS_END}
        .icon=${icon}
        .iconSize=${iconSize}
        .iconBadge=${isSmartAccount ? ICON_BADGE_SIZE.icon : undefined}
        .iconBadgeSize=${isSmartAccount ? ICON_BADGE_SIZE.size : undefined}
        imageSrc=${connectorImage}
        @copy=${this.handleCopyAddress.bind(this)}
        @disconnect=${this.handleDisconnect.bind(this)}
      ></wui-active-profile-wallet-item>
      ${shouldShowLineSeparator ? html`<wui-separator></wui-separator>` : null}
    </wui-flex>`
  }

  private getConnectedWalletData() {
    if (!this.namespace) {
      throw new Error('Namespace must be defined when getting connected wallet data')
    }

    const connectionsByNamespace = this.connections.get(this.namespace) ?? []
    const plainAddress = this.caipAddress
      ? CoreHelperUtil.getPlainAddress(this.caipAddress)
      : undefined
    const connections = ConnectionUtil.excludeAddressFromConnections(
      connectionsByNamespace,
      plainAddress
    )
    const connectionsWithMultipleAccounts = connections.filter(
      connection => connection.accounts.length > 0
    )

    return {
      plainAddress,
      shouldShowLineSeparator: connectionsWithMultipleAccounts.length > 0
    }
  }

  private connectionsTemplate() {
    const { connections } = this.getConnectionsData()

    return html`${this.displayConnections({
      connections,
      includeSeparator: false,
      forceReconnectOnSwitch: false,
      isRecentConnections: false
    })}`
  }

  private getConnectionsData() {
    if (!this.namespace) {
      throw new Error('Namespace must be defined when getting connections data')
    }

    const plainAddress = this.caipAddress
      ? CoreHelperUtil.getPlainAddress(this.caipAddress)
      : undefined

    const connectionsByNamespace = this.connections.get(this.namespace) ?? []
    const connections = ConnectionUtil.excludeAddressFromConnections(
      connectionsByNamespace,
      plainAddress
    )

    const storageConnections = StorageUtil.getConnections()
    const storageConnectionsByNamespace = storageConnections[this.namespace] ?? []
    const storageConnectionsWithCurrentActiveConnectors = storageConnectionsByNamespace.filter(
      connection => ConnectorController.getConnectorById(connection.connectorId)
    )
    const dedupedStorageConnections = ConnectionUtil.excludeExistingConnections(
      connections,
      ConnectionUtil.filterConnections({
        connections: storageConnectionsWithCurrentActiveConnectors,
        filterOutWcConnections: true,
        filterOutAuthConnections: true
      })
    )

    const hasConnections =
      Boolean(this.caipAddress) || connections.length > 0 || dedupedStorageConnections.length > 0

    return { hasConnections, connections, storageConnections: dedupedStorageConnections }
  }

  private getAuthData(connectorId: string) {
    let icon: string | undefined = undefined
    let iconSize: string | undefined = undefined

    const isAuth = connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

    const socialProvider = StorageUtil.getConnectedSocialProvider() as SocialProvider | null
    const socialUsername = StorageUtil.getConnectedSocialUsername() as string | null

    if (isAuth) {
      icon = socialProvider ?? 'mail'
      iconSize = socialProvider ? 'xl' : 'md'
    }

    const authConnector = ConnectorController.getAuthConnector()
    const email = authConnector?.provider.getEmail() ?? ''

    return {
      name: isAuth
        ? ConnectorUtil.getAuthName({
            email,
            socialUsername,
            socialProvider
          })
        : undefined,
      isAuth,
      icon,
      iconSize
    }
  }

  private displayConnections({
    connections,
    includeSeparator = true,
    forceReconnectOnSwitch = false,
    isRecentConnections
  }: DisplayConnectionsParams) {
    return connections
      .filter(connection => connection.accounts.length > 0)
      .map((connection, connectionIdx) => {
        const connector = ConnectorController.getConnectorById(connection.connectorId)
        const connectorImage = AssetUtil.getConnectorImage(connector)

        const isFirstConnection = connectionIdx === 0

        const { icon, iconSize } = this.getAuthData(connection.connectorId)

        return connection.accounts.map((account, accountIdx) => {
          const isFirstAccount = accountIdx === 0

          const isLoading =
            HelpersUtil.isLowerCaseMatch(this.lastSelectedConnectorId, connection.connectorId) &&
            HelpersUtil.isLowerCaseMatch(this.lastSelectedAddress, account.address) &&
            this.isSwitching

          return html`<wui-flex flexDirection="column">
            ${includeSeparator && (!isFirstConnection || !isFirstAccount)
              ? html`<wui-separator></wui-separator>`
              : null}

            <wui-inactive-profile-wallet-item
              address=${account.address}
              alt=${connection.connectorId}
              buttonLabel=${isRecentConnections ? 'Connect' : 'Switch'}
              buttonVariant=${isRecentConnections ? 'neutral' : 'accent'}
              imageSrc=${connectorImage}
              .icon=${icon}
              .iconSize=${iconSize}
              .loading=${isLoading}
              .showBalance=${false}
              .charsStart=${CHARS_START}
              .charsEnd=${CHARS_END}
              @buttonClick=${() =>
                this.handleSwitchWallet({
                  connection,
                  address: account.address,
                  forceReconnect: forceReconnectOnSwitch
                })}
            ></wui-inactive-profile-wallet-item>
          </wui-flex>`
        })
      })
  }

  private recentWalletsTemplate() {
    const { storageConnections } = this.getConnectionsData()

    if (storageConnections.length === 0) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const} rowGap="xs">
        <wui-text color="fg-200" variant="micro-500">RECENTLY CONNECTED</wui-text>

        <wui-flex flexDirection="column">
          ${this.displayConnections({
            connections: storageConnections,
            includeSeparator: true,
            forceReconnectOnSwitch: true,
            isRecentConnections: true
          })}
        </wui-flex>
      </wui-flex>
    `
  }

  private addWalletTemplate() {
    const { hasConnections } = this.getConnectionsData()
    const { title } = this.getChainSwitchText()

    return hasConnections
      ? html`
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="plus"
            iconSize="sm"
            ?chevron=${true}
            @click=${this.handleAddWallet.bind(this)}
          >
            <wui-text variant="paragraph-500" color="fg-200">${title}</wui-text>
          </wui-list-item>
        `
      : html`<wui-flex class="add-wallet-placeholder"></wui-flex>`
  }

  private emptyTemplate() {
    const { hasConnections } = this.getConnectionsData()

    if (hasConnections) {
      return null
    }

    const { title, description } = this.getChainSwitchText()

    return html`
      <wui-flex alignItems="flex-start" class="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowGap="s"
          class="empty-box"
        >
          <wui-icon-box
            size="lg"
            icon="wallet"
            background="gray"
            iconColor="fg-200"
            backgroundColor="glass-002"
          ></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="3xs">
            <wui-text color="fg-100" variant="paragraph-500">No wallet connected</wui-text>
            <wui-text color="fg-200" variant="tiny-500">${description}</wui-text>
          </wui-flex>

          <wui-button variant="neutral" size="md" @click=${this.handleAddWallet.bind(this)}>
            <wui-icon color="inherit" slot="iconLeft" name="plus"></wui-icon>
            ${title}
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private async handleSwitchWallet({
    connection,
    address,
    forceReconnect
  }: HandleSwitchWalletParams) {
    try {
      this.isSwitching = true
      this.lastSelectedConnectorId = connection.connectorId
      this.lastSelectedAddress = address

      if (!this.namespace) {
        throw new Error('Namespace must be defined when switching wallet')
      }

      await ConnectionController.switchAccount({
        connection,
        address,
        namespace: this.namespace as ChainNamespace,
        forceReconnect,
        onConnectorChange() {
          SnackController.showSuccess('Wallet switched')
        },
        onAddressChange() {
          SnackController.showSuccess('Account switched')
        }
      })
    } catch (err) {
      SnackController.showError('Failed to connect wallet')
    } finally {
      this.isSwitching = false
    }
  }

  private async handleDisconnect() {
    try {
      this.isDisconnecting = true
      await ConnectionController.disconnect()
      SnackController.showSuccess('Disconnected')
    } catch (err) {
      SnackController.showError('Failed to disconnect')
    } finally {
      this.isDisconnecting = false
    }
  }

  private handleCopyAddress() {
    SnackController.showSuccess('Copied')
  }

  private handleAddWallet() {
    ConnectorController.setFilterByNamespace(this.namespace)
    RouterController.push('Connect')
  }

  private onTabChange(index: number) {
    this.unsubscribeChainListener?.()
    this.currentTab = index

    const nextNamespace = this.namespaces[index]

    if (!nextNamespace) {
      throw new Error('Namespace must be defined when changing tabs')
    }

    this.namespace = nextNamespace
    this.caipAddress = ChainController.getAccountData(this.namespace)?.caipAddress
    this.profileName = ChainController.getAccountData(this.namespace)?.profileName
    this.smartAccountAddress = AccountController.getSmartAccountAddress(this.namespace)

    ChainController.setActiveNamespace(this.namespace)

    this.unsubscribeChainListener = ChainController.subscribeChainProp(
      'accountState',
      val => {
        this.caipAddress = val?.caipAddress
        this.profileName = val?.profileName
        this.smartAccountAddress = val?.smartAccountAddress
      },
      this.namespace
    )
  }

  private initializeScrollHandling() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list')

    if (!walletListEl) {
      return
    }

    requestAnimationFrame(this.handleConnectListScroll.bind(this))
    walletListEl.addEventListener('scroll', this.handleConnectListScroll.bind(this))
    this.resizeObserver = new ResizeObserver(() => this.handleConnectListScroll())
    this.resizeObserver.observe(walletListEl)
    this.handleConnectListScroll()
  }

  private removeScrollListener() {
    const connectEl = this.shadowRoot?.querySelector('.wallet-list')

    if (connectEl) {
      connectEl.removeEventListener('scroll', this.handleConnectListScroll.bind(this))
    }
  }

  private handleConnectListScroll() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list') as HTMLElement | undefined

    if (!walletListEl) {
      return
    }

    this.updateScrollOpacity(walletListEl)
  }

  private updateScrollOpacity(element: HTMLElement) {
    element.style.setProperty(
      '--connect-scroll--top-opacity',
      MathUtil.interpolate([0, 50], [0, 1], element.scrollTop).toString()
    )
    element.style.setProperty(
      '--connect-scroll--bottom-opacity',
      MathUtil.interpolate(
        [0, 50],
        [0, 1],
        element.scrollHeight - element.scrollTop - element.offsetHeight
      ).toString()
    )
  }

  private getChainSwitchText() {
    switch (this.namespace) {
      case 'eip155':
        return {
          title: 'Add EVM Wallet',
          description: 'Add your first EVM wallet'
        }
      case 'solana':
        return {
          title: 'Add Solana Wallet',
          description: 'Add your first Solana wallet'
        }
      case 'bip122':
        return {
          title: 'Add Bitcoin Wallet',
          description: 'Add your first Bitcoin wallet'
        }
      default:
        return {
          title: 'Add Wallet',
          description: 'Add your first wallet'
        }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
