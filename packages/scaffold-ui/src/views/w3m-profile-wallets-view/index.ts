import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import {
  type CaipAddress,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  SnackController,
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
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const TABS_PADDING = 16
const TABS_INNER_PADDING = 4

// -- Types -------------------------------- //
interface Account {
  address: string
  type?: string
}

interface WalletActionParams {
  connection: Connection
  address: string
  isRecentConnection: boolean
  namespace: ChainNamespace
}

interface ProfileContentParams {
  address: string
  connections: Connection[]
  connectorId: string
  namespace: ChainNamespace
}

// -- Constants ----------------------------------------- //
const UI_CONFIG = {
  ADDRESS_DISPLAY: { START: 4, END: 6 },
  BADGE: { SIZE: 'md', ICON: 'lightbulb' },
  SCROLL_THRESHOLD: 50,
  OPACITY_RANGE: [0, 1] as number[]
} as const

const NAMESPACE_ICONS = {
  eip155: 'ethereum',
  solana: 'solana',
  bip122: 'bitcoin'
} as const

const NAMESPACE_TABS = [
  { namespace: 'eip155', icon: NAMESPACE_ICONS.eip155, label: 'EVM' },
  { namespace: 'solana', icon: NAMESPACE_ICONS.solana, label: 'Solana' },
  { namespace: 'bip122', icon: NAMESPACE_ICONS.bip122, label: 'Bitcoin' }
] as const

const CHAIN_LABELS = {
  eip155: { title: 'Add EVM Wallet', description: 'Add your first EVM wallet' },
  solana: { title: 'Add Solana Wallet', description: 'Add your first Solana wallet' },
  bip122: { title: 'Add Bitcoin Wallet', description: 'Add your first Bitcoin wallet' }
} as const

@customElement('w3m-profile-wallets-view')
export class W3mProfileWalletsView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribers: (() => void)[] = []
  private resizeObserver?: ResizeObserver
  private chainListener?: () => void
  private tabsResizeObserver?: ResizeObserver

  // -- State & Properties -------------------------------- //
  @state() private currentTab = 0
  @state() private namespace = ChainController.state.activeChain
  @state() private namespaces = Array.from(ChainController.state.chains.keys())
  @state() private caipAddress: CaipAddress | undefined = undefined
  @state() private profileName: string | null | undefined = undefined
  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds
  @state() private lastSelectedAddress = ''
  @state() private lastSelectedConnectorId = ''
  @state() private isSwitching = false
  @state() private caipNetwork = ChainController.state.activeCaipNetwork
  @state() private user = AccountController.state.user
  @state() private remoteFeatures = OptionsController.state.remoteFeatures
  @state() private tabWidth = ''

  constructor() {
    super()

    this.currentTab = this.namespace ? this.namespaces.indexOf(this.namespace) : 0
    this.caipAddress = ChainController.getAccountData(this.namespace)?.caipAddress
    this.profileName = ChainController.getAccountData(this.namespace)?.profileName

    this.unsubscribers.push(
      ...[
        ConnectionController.subscribeKey('connections', () => this.requestUpdate()),
        ConnectionController.subscribeKey('recentConnections', () => this.requestUpdate()),
        ConnectorController.subscribeKey('activeConnectorIds', ids => {
          this.activeConnectorIds = ids
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => (this.caipNetwork = val)),
        AccountController.subscribeKey('user', val => (this.user = val)),
        OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val))
      ]
    )

    this.chainListener = ChainController.subscribeChainProp(
      'accountState',
      accountState => {
        this.caipAddress = accountState?.caipAddress
        this.profileName = accountState?.profileName
      },
      this.namespace
    )
  }

  override disconnectedCallback() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.disconnect()
    this.tabsResizeObserver?.disconnect()
    this.removeScrollListener()
    this.chainListener?.()
  }

  override firstUpdated() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list')
    const tabsEl = this.shadowRoot?.querySelector('wui-tabs')

    if (!walletListEl) {
      return
    }

    const handleScroll = () => this.updateScrollOpacity(walletListEl as HTMLElement)

    requestAnimationFrame(handleScroll)
    walletListEl.addEventListener('scroll', handleScroll)

    this.resizeObserver = new ResizeObserver(handleScroll)
    this.resizeObserver.observe(walletListEl)
    handleScroll()

    if (tabsEl) {
      const handleTabsResize = () => {
        const availableTabs = NAMESPACE_TABS.filter(tab =>
          this.namespaces.includes(tab.namespace as ChainNamespace)
        )

        const tabCount = availableTabs.length

        if (tabCount > 1) {
          const containerWidth = this.offsetWidth
          const totalInnerTabsPadding = TABS_INNER_PADDING * 2
          const totalTabsPadding = TABS_PADDING * 2
          const availableWidth = containerWidth - totalTabsPadding - totalInnerTabsPadding
          const tabWidth = availableWidth / tabCount
          this.tabWidth = `${tabWidth}px`
          this.requestUpdate()
        }
      }

      this.tabsResizeObserver = new ResizeObserver(handleTabsResize)
      this.tabsResizeObserver.observe(this)
      handleTabsResize()
    }
  }

  override render() {
    const namespace = this.namespace

    if (!namespace) {
      throw new Error('Namespace is not set')
    }

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const} gap="l">
        ${this.renderTabs()} ${this.renderHeader(namespace)} ${this.renderConnections(namespace)}
        ${this.renderAddConnectionButton(namespace)}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private renderTabs() {
    const availableTabs = NAMESPACE_TABS.filter(tab =>
      this.namespaces.includes(tab.namespace as ChainNamespace)
    )

    const tabCount = availableTabs.length
    if (tabCount > 1) {
      return html`
        <wui-tabs
          .onTabChange=${(index: number) => this.handleTabChange(index)}
          .activeTab=${this.currentTab}
          localTabWidth=${this.tabWidth}
          .tabs=${availableTabs}
        ></wui-tabs>
      `
    }

    return null
  }

  private renderHeader(namespace: ChainNamespace) {
    const connections = this.getActiveConnections(namespace)
    const totalConnections =
      connections.flatMap(({ accounts }) => accounts).length + (this.caipAddress ? 1 : 0)

    return html`
      <wui-flex alignItems="center" columnGap="3xs">
        <wui-icon
          name=${NAMESPACE_ICONS[namespace as keyof typeof NAMESPACE_ICONS] ??
          NAMESPACE_ICONS.eip155}
          size="lg"
        ></wui-icon>
        <wui-text color="fg-200" variant="small-400"
          >${totalConnections > 1 ? 'Wallets' : 'Wallet'}</wui-text
        >
        <wui-text
          color="fg-100"
          variant="small-400"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${totalConnections}
        </wui-text>
        <wui-link
          color="fg-200"
          @click=${() => ConnectionController.disconnect({ namespace })}
          ?disabled=${!this.hasAnyConnections(namespace)}
          data-testid="disconnect-all-button"
        >
          Disconnect All
        </wui-link>
      </wui-flex>
    `
  }

  private renderConnections(namespace: ChainNamespace) {
    const hasConnections = this.hasAnyConnections(namespace)

    const classes = {
      'wallet-list': true,
      'active-wallets-box': hasConnections,
      'empty-wallet-list-box': !hasConnections
    }

    return html`
      <wui-flex flexDirection="column" class=${classMap(classes)} rowGap="s">
        ${hasConnections
          ? this.renderActiveConnections(namespace)
          : this.renderEmptyState(namespace)}
      </wui-flex>
    `
  }

  private renderActiveConnections(namespace: ChainNamespace) {
    const connections = this.getActiveConnections(namespace)
    const connectorId = this.activeConnectorIds[namespace]
    const plainAddress = this.getPlainAddress()

    return html`
      ${plainAddress || connectorId || connections.length > 0
        ? html`<wui-flex
            flexDirection="column"
            .padding=${['l', '0', 'xs', '0'] as const}
            class="active-wallets"
          >
            ${this.renderActiveProfile(namespace)} ${this.renderActiveConnectionsList(namespace)}
          </wui-flex>`
        : null}
      ${this.renderRecentConnections(namespace)}
    `
  }

  private renderActiveProfile(namespace: ChainNamespace) {
    const connectorId = this.activeConnectorIds[namespace]

    if (!connectorId) {
      return null
    }

    const { connections } = ConnectionControllerUtil.getConnectionsData(namespace)
    const connector = ConnectorController.getConnectorById(connectorId)
    const connectorImage = AssetUtil.getConnectorImage(connector)
    const plainAddress = this.getPlainAddress()

    if (!plainAddress) {
      return null
    }

    const isBitcoin = namespace === CommonConstantsUtil.CHAIN.BITCOIN
    const authData = ConnectionUtil.getAuthData({ connectorId, accounts: [] })
    const shouldShowSeparator =
      this.getActiveConnections(namespace).flatMap(connection => connection.accounts).length > 0

    const connection = connections.find(c => c.connectorId === connectorId)
    const account = connection?.accounts.filter(
      a => !HelpersUtil.isLowerCaseMatch(a.address, plainAddress)
    )

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', '0', 'l'] as const}>
        <wui-active-profile-wallet-item
          address=${plainAddress}
          alt=${connector?.name}
          .content=${this.getProfileContent({
            address: plainAddress,
            connections,
            connectorId,
            namespace
          })}
          .charsStart=${UI_CONFIG.ADDRESS_DISPLAY.START}
          .charsEnd=${UI_CONFIG.ADDRESS_DISPLAY.END}
          .icon=${authData.icon}
          .iconSize=${authData.iconSize}
          .iconBadge=${this.isSmartAccount(plainAddress) ? UI_CONFIG.BADGE.ICON : undefined}
          .iconBadgeSize=${this.isSmartAccount(plainAddress) ? UI_CONFIG.BADGE.SIZE : undefined}
          imageSrc=${connectorImage}
          ?enableMoreButton=${authData.isAuth}
          @copy=${() => this.handleCopyAddress(plainAddress)}
          @disconnect=${() => this.handleDisconnect(namespace, { id: connectorId })}
          @switch=${() => {
            if (isBitcoin && connection && account?.[0]) {
              this.handleSwitchWallet(connection, account[0].address, namespace)
            }
          }}
          @externalLink=${() => this.handleExternalLink(plainAddress)}
          @more=${() => this.handleMore()}
          data-testid="wui-active-profile-wallet-item"
        ></wui-active-profile-wallet-item>
        ${shouldShowSeparator ? html`<wui-separator></wui-separator>` : null}
      </wui-flex>
    `
  }

  private renderActiveConnectionsList(namespace: ChainNamespace) {
    const connections = this.getActiveConnections(namespace)

    if (connections.length === 0) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const}>
        ${this.renderConnectionList(connections, false, namespace)}
      </wui-flex>
    `
  }

  private renderRecentConnections(namespace: ChainNamespace) {
    const { recentConnections } = ConnectionControllerUtil.getConnectionsData(namespace)

    const allAccounts = recentConnections.flatMap(connection => connection.accounts)

    if (allAccounts.length === 0) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const} rowGap="xs">
        <wui-text color="fg-200" variant="micro-500" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const}>
          ${this.renderConnectionList(recentConnections, true, namespace)}
        </wui-flex>
      </wui-flex>
    `
  }

  private renderConnectionList(
    connections: Connection[],
    isRecentConnections: boolean,
    namespace: ChainNamespace
  ) {
    return connections
      .filter(connection => connection.accounts.length > 0)
      .map((connection, connectionIdx) => {
        const connector = ConnectorController.getConnectorById(connection.connectorId)
        const connectorImage = AssetUtil.getConnectorImage(connector) ?? ''
        const authData = ConnectionUtil.getAuthData(connection)

        return connection.accounts.map((account, accountIdx) => {
          const shouldShowSeparator = connectionIdx !== 0 || accountIdx !== 0
          const isLoading = this.isAccountLoading(connection.connectorId, account.address)

          return html`
            <wui-flex flexDirection="column">
              ${shouldShowSeparator ? html`<wui-separator></wui-separator>` : null}
              <wui-inactive-profile-wallet-item
                address=${account.address}
                alt=${connection.connectorId}
                buttonLabel=${isRecentConnections ? 'Connect' : 'Switch'}
                buttonVariant=${isRecentConnections ? 'neutral' : 'accent'}
                rightIcon=${isRecentConnections ? 'bin' : 'off'}
                rightIconSize="sm"
                class=${isRecentConnections ? 'recent-connection' : 'active-connection'}
                data-testid=${isRecentConnections ? 'recent-connection' : 'active-connection'}
                imageSrc=${connectorImage}
                .iconBadge=${this.isSmartAccount(account.address)
                  ? UI_CONFIG.BADGE.ICON
                  : undefined}
                .iconBadgeSize=${this.isSmartAccount(account.address)
                  ? UI_CONFIG.BADGE.SIZE
                  : undefined}
                .icon=${authData.icon}
                .iconSize=${authData.iconSize}
                .loading=${isLoading}
                .showBalance=${false}
                .charsStart=${UI_CONFIG.ADDRESS_DISPLAY.START}
                .charsEnd=${UI_CONFIG.ADDRESS_DISPLAY.END}
                @buttonClick=${() =>
                  this.handleSwitchWallet(connection, account.address, namespace)}
                @iconClick=${() =>
                  this.handleWalletAction({
                    connection,
                    address: account.address,
                    isRecentConnection: isRecentConnections,
                    namespace
                  })}
              ></wui-inactive-profile-wallet-item>
            </wui-flex>
          `
        })
      })
  }

  private renderAddConnectionButton(namespace: ChainNamespace) {
    if (!this.isMultiWalletEnabled() && this.caipAddress) {
      return null
    }

    if (!this.hasAnyConnections(namespace)) {
      return null
    }

    const { title } = this.getChainLabelInfo(namespace)

    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${true}
        @click=${() => this.handleAddConnection(namespace)}
        data-testid="add-connection-button"
      >
        <wui-text variant="paragraph-500" color="fg-200">${title}</wui-text>
      </wui-list-item>
    `
  }

  private renderEmptyState(namespace: ChainNamespace) {
    const { title, description } = this.getChainLabelInfo(namespace)

    return html`
      <wui-flex alignItems="flex-start" class="empty-template" data-testid="empty-template">
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
            <wui-text color="fg-100" variant="paragraph-500" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="fg-200" variant="tiny-500" data-testid="empty-state-description"
              >${description}</wui-text
            >
          </wui-flex>

          <wui-button
            variant="neutral"
            size="md"
            @click=${() => this.handleAddConnection(namespace)}
            data-testid="empty-state-button"
          >
            <wui-icon color="inherit" slot="iconLeft" name="plus"></wui-icon>
            ${title}
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private handleTabChange(index: number) {
    const nextNamespace = this.namespaces[index]

    if (nextNamespace) {
      this.chainListener?.()
      this.currentTab = this.namespaces.indexOf(nextNamespace)
      this.namespace = nextNamespace

      this.caipAddress = ChainController.getAccountData(nextNamespace)?.caipAddress
      this.profileName = ChainController.getAccountData(nextNamespace)?.profileName

      this.chainListener = ChainController.subscribeChainProp(
        'accountState',
        accountState => {
          this.caipAddress = accountState?.caipAddress
        },
        nextNamespace
      )
    }
  }

  private async handleSwitchWallet(
    connection: Connection,
    address: string,
    namespace: ChainNamespace
  ) {
    try {
      this.isSwitching = true
      this.lastSelectedConnectorId = connection.connectorId
      this.lastSelectedAddress = address

      await ConnectionController.switchConnection({
        connection,
        address,
        namespace,
        closeModalOnConnect: false,
        onChange({ hasSwitchedAccount, hasSwitchedWallet }) {
          if (hasSwitchedWallet) {
            SnackController.showSuccess('Wallet switched')
          } else if (hasSwitchedAccount) {
            SnackController.showSuccess('Account switched')
          }
        }
      })
    } catch (error) {
      SnackController.showError('Failed to switch wallet')
    } finally {
      this.isSwitching = false
    }
  }

  private handleWalletAction(params: WalletActionParams) {
    const { connection, address, isRecentConnection, namespace } = params

    if (isRecentConnection) {
      StorageUtil.deleteAddressFromConnection({
        connectorId: connection.connectorId,
        address,
        namespace
      })
      ConnectionController.syncStorageConnections()
      SnackController.showSuccess('Wallet deleted')
    } else {
      this.handleDisconnect(namespace, { id: connection.connectorId })
    }
  }

  private async handleDisconnect(namespace: ChainNamespace, { id }: { id?: string }) {
    try {
      await ConnectionController.disconnect({ id, namespace })
      SnackController.showSuccess('Wallet disconnected')
    } catch {
      SnackController.showError('Failed to disconnect wallet')
    }
  }

  private handleCopyAddress(address: string) {
    CoreHelperUtil.copyToClopboard(address)
    SnackController.showSuccess('Address copied')
  }

  private handleMore() {
    RouterController.push('AccountSettings')
  }

  private handleExternalLink(address: string) {
    const explorerUrl = this.caipNetwork?.blockExplorers?.default.url

    if (explorerUrl) {
      CoreHelperUtil.openHref(`${explorerUrl}/address/${address}`, '_blank')
    }
  }

  private handleAddConnection(namespace: ChainNamespace) {
    ConnectorController.setFilterByNamespace(namespace)
    RouterController.push('Connect')
  }

  private getChainLabelInfo(namespace: ChainNamespace) {
    return (
      CHAIN_LABELS[namespace as keyof typeof CHAIN_LABELS] ?? {
        title: 'Add Wallet',
        description: 'Add your first wallet'
      }
    )
  }

  private isSmartAccount(address?: string) {
    if (!this.namespace) {
      return false
    }

    const smartAccount = this.user?.accounts?.find(account => account.type === 'smartAccount')

    if (smartAccount && address) {
      return HelpersUtil.isLowerCaseMatch(smartAccount.address, address)
    }

    return false
  }

  private getPlainAddress() {
    return this.caipAddress ? CoreHelperUtil.getPlainAddress(this.caipAddress) : undefined
  }

  private getActiveConnections(namespace: ChainNamespace) {
    const connectorId = this.activeConnectorIds[namespace]
    const { connections } = ConnectionControllerUtil.getConnectionsData(namespace)

    const [connectedConnection] = connections.filter(connection =>
      HelpersUtil.isLowerCaseMatch(connection.connectorId, connectorId)
    )

    if (!connectorId) {
      return connections
    }

    const isBitcoin = namespace === CommonConstantsUtil.CHAIN.BITCOIN

    const { address } = this.caipAddress ? ParseUtil.parseCaipAddress(this.caipAddress) : {}

    let addresses = [...(address ? [address] : [])]

    if (isBitcoin && connectedConnection) {
      addresses = connectedConnection.accounts.map(account => account.address) || []
    }

    return ConnectionControllerUtil.excludeConnectorAddressFromConnections({
      connectorId,
      addresses,
      connections
    })
  }

  private hasAnyConnections(namespace: ChainNamespace) {
    const connections = this.getActiveConnections(namespace)
    const { recentConnections } = ConnectionControllerUtil.getConnectionsData(namespace)

    return Boolean(this.caipAddress) || connections.length > 0 || recentConnections.length > 0
  }

  private isAccountLoading(connectorId: string, address: string) {
    return (
      HelpersUtil.isLowerCaseMatch(this.lastSelectedConnectorId, connectorId) &&
      HelpersUtil.isLowerCaseMatch(this.lastSelectedAddress, address) &&
      this.isSwitching
    )
  }

  private getProfileContent(params: ProfileContentParams) {
    const { address, connections, connectorId, namespace } = params
    const [connectedConnection] = connections.filter(connection =>
      HelpersUtil.isLowerCaseMatch(connection.connectorId, connectorId)
    )

    if (
      namespace === CommonConstantsUtil.CHAIN.BITCOIN &&
      connectedConnection?.accounts.every(account => typeof account.type === 'string')
    ) {
      return this.getBitcoinProfileContent(connectedConnection.accounts, address)
    }

    const authData = ConnectionUtil.getAuthData({ connectorId, accounts: [] })

    return [
      {
        address,
        tagLabel: 'Active',
        tagVariant: 'success',
        enableButton: true,
        profileName: this.profileName,
        buttonType: 'disconnect',
        buttonLabel: 'Disconnect',
        buttonVariant: 'neutral',
        ...(authData.isAuth
          ? { description: this.isSmartAccount(address) ? 'Smart Account' : 'EOA Account' }
          : {})
      }
    ]
  }

  private getBitcoinProfileContent(accounts: Account[], address: string) {
    const hasMultipleAccounts = accounts.length > 1
    const plainAddress = this.getPlainAddress()

    return accounts.map(account => {
      const isConnected = HelpersUtil.isLowerCaseMatch(account.address, plainAddress)

      let label = 'PAYMENT'

      if (account.type === 'ordinal') {
        label = 'ORDINALS'
      }

      return {
        address: account.address,
        tagLabel: HelpersUtil.isLowerCaseMatch(account.address, address) ? 'Active' : undefined,
        tagVariant: HelpersUtil.isLowerCaseMatch(account.address, address) ? 'success' : undefined,
        enableButton: true,
        ...(hasMultipleAccounts
          ? {
              label,
              alignItems: 'flex-end',
              buttonType: isConnected ? 'disconnect' : 'switch',
              buttonLabel: isConnected ? 'Disconnect' : 'Switch',
              buttonVariant: isConnected ? 'neutral' : 'accent'
            }
          : {
              alignItems: 'center',
              buttonType: 'disconnect',
              buttonLabel: 'Disconnect',
              buttonVariant: 'neutral'
            })
      }
    })
  }

  private removeScrollListener() {
    const connectEl = this.shadowRoot?.querySelector('.wallet-list')

    if (connectEl) {
      connectEl.removeEventListener('scroll', () => this.handleConnectListScroll())
    }
  }

  private handleConnectListScroll() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list') as HTMLElement

    if (walletListEl) {
      this.updateScrollOpacity(walletListEl)
    }
  }

  private isMultiWalletEnabled() {
    return Boolean(this.remoteFeatures?.multiWallet)
  }

  private updateScrollOpacity(element: HTMLElement) {
    element.style.setProperty(
      '--connect-scroll--top-opacity',
      MathUtil.interpolate(
        [0, UI_CONFIG.SCROLL_THRESHOLD],
        UI_CONFIG.OPACITY_RANGE,
        element.scrollTop
      ).toString()
    )
    element.style.setProperty(
      '--connect-scroll--bottom-opacity',
      MathUtil.interpolate(
        [0, UI_CONFIG.SCROLL_THRESHOLD],
        UI_CONFIG.OPACITY_RANGE,
        element.scrollHeight - element.scrollTop - element.offsetHeight
      ).toString()
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
