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
] as const satisfies { namespace: ChainNamespace; icon: string; label: string }[]

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
  @state() private user = ChainController.getAccountData()?.user
  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  constructor() {
    super()

    this.currentTab = this.namespace ? this.namespaces.indexOf(this.namespace) : 0
    this.caipAddress = ChainController.getAccountData(this.namespace)?.caipAddress
    this.profileName = ChainController.getAccountData(this.namespace)?.profileName

    this.unsubscribers.push(
      ...[
        ConnectionController.subscribeKey('connections', () => this.onConnectionsChange()),
        ConnectionController.subscribeKey('recentConnections', () => this.requestUpdate()),
        ConnectorController.subscribeKey('activeConnectorIds', ids => {
          this.activeConnectorIds = ids
        }),
        ChainController.subscribeKey('activeCaipNetwork', val => (this.caipNetwork = val)),
        ChainController.subscribeChainProp('accountState', val => {
          this.user = val?.user
        }),
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
    this.removeScrollListener()
    this.chainListener?.()
  }

  override firstUpdated() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list')

    if (!walletListEl) {
      return
    }

    const handleScroll = () => this.updateScrollOpacity(walletListEl as HTMLElement)

    requestAnimationFrame(handleScroll)
    walletListEl.addEventListener('scroll', handleScroll)

    this.resizeObserver = new ResizeObserver(handleScroll)
    this.resizeObserver.observe(walletListEl)
    handleScroll()
  }

  override render() {
    const namespace = this.namespace

    if (!namespace) {
      throw new Error('Namespace is not set')
    }

    return html`
      <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4'] as const} gap="4">
        ${this.renderTabs()} ${this.renderHeader(namespace)} ${this.renderConnections(namespace)}
        ${this.renderAddConnectionButton(namespace)}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private renderTabs() {
    const availableTabs = NAMESPACE_TABS.filter(tab => this.namespaces.includes(tab.namespace))

    const tabCount = availableTabs.length
    if (tabCount > 1) {
      return html`
        <wui-tabs
          .onTabChange=${(index: number) => this.handleTabChange(index)}
          .activeTab=${this.currentTab}
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
      <wui-flex alignItems="center" columngap="1">
        <wui-icon
          size="sm"
          name=${NAMESPACE_ICONS[namespace as keyof typeof NAMESPACE_ICONS] ??
          NAMESPACE_ICONS.eip155}
        ></wui-icon>
        <wui-text color="secondary" variant="lg-regular"
          >${totalConnections > 1 ? 'Wallets' : 'Wallet'}</wui-text
        >
        <wui-text
          color="primary"
          variant="lg-regular"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${totalConnections}
        </wui-text>
        <wui-link
          color="secondary"
          variant="secondary"
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
      <wui-flex flexDirection="column" class=${classMap(classes)} rowgap="3">
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
            .padding=${['4', '0', '4', '0'] as const}
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
      <wui-flex flexDirection="column" .padding=${['0', '4', '0', '4'] as const}>
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
          @disconnect=${() => this.handleDisconnect(namespace, connectorId)}
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
      <wui-flex flexDirection="column" .padding=${['0', '2', '0', '2'] as const}>
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
      <wui-flex flexDirection="column" .padding=${['0', '2', '0', '2'] as const} rowGap="2">
        <wui-text color="secondary" variant="sm-medium" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${['0', '2', '0', '2'] as const}>
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
                buttonVariant=${isRecentConnections ? 'neutral-secondary' : 'accent-secondary'}
                rightIcon=${isRecentConnections ? 'bin' : 'power'}
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
        <wui-text variant="md-medium" color="secondary">${title}</wui-text>
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
          rowgap="3"
          class="empty-box"
        >
          <wui-icon-box size="xl" icon="wallet" color="secondary"></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="1">
            <wui-text color="primary" variant="lg-regular" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="secondary" variant="md-regular" data-testid="empty-state-description"
              >${description}</wui-text
            >
          </wui-flex>

          <wui-link
            @click=${() => this.handleAddConnection(namespace)}
            data-testid="empty-state-button"
            icon="plus"
          >
            ${title}
          </wui-link>
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
      this.handleDisconnect(namespace, connection.connectorId)
    }
  }

  private async handleDisconnect(namespace: ChainNamespace, id: string) {
    try {
      await ConnectionController.disconnectConnector({ id, namespace })
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
    RouterController.push('Connect', {
      addWalletForNamespace: namespace
    })
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
        buttonVariant: 'neutral-secondary',
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
              buttonVariant: isConnected ? 'neutral-secondary' : 'accent-secondary'
            }
          : {
              alignItems: 'center',
              buttonType: 'disconnect',
              buttonLabel: 'Disconnect',
              buttonVariant: 'neutral-secondary'
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

  private onConnectionsChange() {
    if (this.isMultiWalletEnabled()) {
      if (this.namespace) {
        const { connections } = ConnectionControllerUtil.getConnectionsData(this.namespace)

        /*
         * If no connections are available then prevent the user from navigating
         * back to the profile screen to avoid showing a blank view
         */
        if (connections.length === 0) {
          RouterController.reset('ProfileWallets')
        }
      }
    }

    this.requestUpdate()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
