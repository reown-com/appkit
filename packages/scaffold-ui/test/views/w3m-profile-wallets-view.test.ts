import { fixture } from '@open-wc/testing'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  type Connection,
  ConstantsUtil
} from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  type ChainControllerState,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  type ConnectorWithProviders,
  CoreHelperUtil,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  StorageUtil
} from '@reown/appkit-controllers'

import { W3mProfileWalletsView } from '../../src/views/w3m-profile-wallets-view/index'

// --- Constants ---------------------------------------------------- //
const TABS_COMPONENT = 'wui-tabs'
const ACTIVE_PROFILE_WALLET = 'wui-active-profile-wallet-item'

// Test Data
const mockEthereumNetwork = {
  id: 1,
  name: 'Ethereum',
  namespace: ConstantsUtil.CHAIN.EVM,
  blockExplorers: {
    default: { url: 'https://etherscan.io' }
  }
} as unknown as CaipNetwork

const mockSolanaNetwork = {
  id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  namespace: ConstantsUtil.CHAIN.SOLANA
} as unknown as CaipNetwork

const mockBitcoinNetwork = {
  id: 'bitcoin:000000000019d6689c085ae165831e93',
  name: 'Bitcoin',
  namespace: ConstantsUtil.CHAIN.BITCOIN
} as unknown as CaipNetwork

const mockMetaMaskConnector = {
  id: 'metamask',
  name: 'MetaMask',
  type: 'ANNOUNCED'
} as ConnectorWithProviders

const mockWalletConnectConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  type: 'WALLET_CONNECT'
} as ConnectorWithProviders

const mockAuthConnector = {
  id: 'ID_AUTH',
  type: 'AUTH',
  name: 'Auth',
  chain: 'eip155'
} as ConnectorWithProviders

const mockEthereumAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
const mockBitcoinAddress =
  'bip122:000000000019d6689c085ae165831e93:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

const mockActiveConnection: Connection = {
  connectorId: 'metamask',
  accounts: [
    { address: '0x1234567890123456789012345678901234567890', type: 'eoa' },
    { address: '0x9876543210987654321098765432109876543210', type: 'smart' }
  ]
}

const mockRecentConnection: Connection = {
  connectorId: 'walletconnect',
  accounts: [{ address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', type: 'eoa' }]
}

const mockBitcoinConnection: Connection = {
  connectorId: 'bitcoin-wallet',
  accounts: [
    { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', type: 'payment' },
    { address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', type: 'ordinals' }
  ]
}

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeAll(() => {
  vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
    ...OptionsController.state,
    remoteFeatures: { multiWallet: true }
  })
})

describe('W3mProfileWalletsView - Basic Rendering', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    // Setup default state
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ],
        [
          ConstantsUtil.CHAIN.SOLANA,
          { namespace: ConstantsUtil.CHAIN.SOLANA, caipNetworks: [mockSolanaNetwork] }
        ],
        [
          ConstantsUtil.CHAIN.BITCOIN,
          { namespace: ConstantsUtil.CHAIN.BITCOIN, caipNetworks: [mockBitcoinNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector, mockWalletConnectConnector, mockAuthConnector]
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockEthereumAddress as CaipAddress,
      profileName: 'Test Profile'
    } as unknown as AccountState)

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: [mockRecentConnection]
    })

    vi.spyOn(ConnectionController, 'subscribeKey').mockReturnValue(() => {})
    vi.spyOn(ConnectorController, 'subscribeKey').mockReturnValue(() => {})
    vi.spyOn(ChainController, 'subscribeKey').mockReturnValue(() => {})
    vi.spyOn(ChainController, 'subscribeChainProp').mockReturnValue(() => {})
  })

  afterEach(() => {
    vi.resetAllMocks
  })

  it('should render basic structure with header and connections', async () => {
    const mockConnections: Connection[] = [
      {
        connectorId: 'walletconnect',
        accounts: [{ address: '0x9876543210987654321098765432109876543210', type: 'eoa' }]
      }
    ]

    vi.mocked(ConnectionControllerUtil.getConnectionsData).mockReturnValue({
      connections: mockConnections,
      recentConnections: []
    })

    vi.mocked(ConnectorController.state.activeConnectorIds).eip155 = 'metamask'
    vi.mocked(ChainController.getAccountData).mockReturnValue({
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890',
      profileName: 'Test Profile'
    } as unknown as AccountState)

    const element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    await element.updateComplete

    const headerIcon = element.shadowRoot?.querySelector('wui-icon[name="ethereum"]')
    expect(headerIcon).not.toBeNull()

    const walletCountText = element.shadowRoot?.querySelector('[data-testid="balance-amount"]')
    expect(walletCountText?.textContent?.trim()).toBe('2')
  })

  it('should throw error when namespace is not set', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: undefined,
      chains: new Map()
    } as unknown as ChainControllerState)

    expect(async () => {
      await fixture(html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`)
    }).rejects.toThrow('Namespace is not set')
  })
})

describe('W3mProfileWalletsView - Tabs Rendering', () => {
  beforeEach(() => {
    vi.resetAllMocks
  })

  it('should render tabs when multiple namespaces are available', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ],
        [
          ConstantsUtil.CHAIN.SOLANA,
          { namespace: ConstantsUtil.CHAIN.SOLANA, caipNetworks: [mockSolanaNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: []
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const tabs = element.shadowRoot?.querySelector(TABS_COMPONENT)
    expect(tabs).not.toBeNull()
  })

  it('should not render tabs when only one namespace is available', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: []
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const tabs = element.shadowRoot?.querySelector(TABS_COMPONENT)
    expect(tabs).toBeNull()
  })

  it('should render tabs with correct mobile width calculation', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ],
        [
          ConstantsUtil.CHAIN.SOLANA,
          { namespace: ConstantsUtil.CHAIN.SOLANA, caipNetworks: [mockSolanaNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: []
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const tabs = element.shadowRoot?.querySelector(TABS_COMPONENT)
    expect(tabs).not.toBeNull()
  })
})

describe('W3mProfileWalletsView - Active Profile Rendering', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector]
    })

    vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockMetaMaskConnector)
  })

  it('should render active profile when connector and address exist', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockEthereumAddress as CaipAddress,
      profileName: 'Test Profile'
    } as unknown as AccountState)

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const activeProfile = element.shadowRoot?.querySelector(ACTIVE_PROFILE_WALLET)
    expect(activeProfile).not.toBeNull()
    expect(activeProfile?.getAttribute('address')).toBe(
      '0x1234567890123456789012345678901234567890'
    )
  })

  it('should not render active profile when no connector is active', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector]
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const activeProfile = element.shadowRoot?.querySelector(ACTIVE_PROFILE_WALLET)
    expect(activeProfile).toBeNull()
  })

  it('should render smart account badge for smart accounts', async () => {
    const mockConnections: Connection[] = [
      {
        connectorId: 'metamask',
        accounts: [{ address: '0x1234567890123456789012345678901234567890' }]
      }
    ]

    vi.mocked(ConnectionControllerUtil.getConnectionsData).mockReturnValue({
      connections: mockConnections,
      recentConnections: []
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      user: {
        accounts: [
          {
            type: 'smartAccount',
            address: '0x1234567890123456789012345678901234567890'
          }
        ]
      }
    } as unknown as AccountState)
    vi.mocked(ConnectorController.state.activeConnectorIds).eip155 = 'metamask'
    vi.mocked(ChainController.getAccountData).mockReturnValue({
      caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890',
      profileName: 'Smart Account'
    } as unknown as AccountState)

    const element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    await element.updateComplete

    const activeProfile = element.shadowRoot?.querySelector(ACTIVE_PROFILE_WALLET)

    expect(activeProfile?.iconBadge).toBeUndefined()
  })
})

describe('W3mProfileWalletsView - Connections List', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector, mockWalletConnectConnector]
    })

    vi.spyOn(ConnectorController, 'getConnectorById').mockImplementation(id => {
      return id === 'metamask' ? mockMetaMaskConnector : mockWalletConnectConnector
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
  })

  it('should render active connections list', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const inactiveProfiles = element.shadowRoot?.querySelectorAll(
      '[data-testid="active-connection"]'
    )
    expect(inactiveProfiles?.length).toBe(2)
  })

  it('should render recent connections with correct labels', async () => {
    const mockRecentConnections: Connection[] = [
      {
        connectorId: 'walletconnect',
        accounts: [{ address: '0x9876543210987654321098765432109876543210', type: 'eoa' }]
      },
      {
        connectorId: 'meld',
        accounts: [{ address: '0x1111111111111111111111111111111111111111', type: 'eoa' }]
      }
    ]

    vi.mocked(ConnectionControllerUtil.getConnectionsData).mockReturnValue({
      connections: [],
      recentConnections: mockRecentConnections
    })

    const element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    await element.updateComplete

    const recentConnectionsText = element.shadowRoot?.querySelector(
      '[data-testid="recently-connected-text"]'
    )
    expect(recentConnectionsText?.textContent).toBe('RECENTLY CONNECTED')

    const recentProfiles = element.shadowRoot?.querySelectorAll('[data-testid="recent-connection"]')
    expect(recentProfiles).toHaveLength(2)
  })

  it('should render correct button labels for active vs recent connections', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: [mockRecentConnection]
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const activeConnections = element.shadowRoot?.querySelectorAll(
      '[data-testid="active-connection"]'
    )
    const recentConnections = element.shadowRoot?.querySelectorAll(
      '[data-testid="recent-connection"]'
    )

    expect(activeConnections?.length).toBeGreaterThan(0)
    expect(recentConnections?.length).toBeGreaterThan(0)

    activeConnections?.forEach(profile => {
      expect(profile.getAttribute('buttonLabel')).toBe('Switch')
      expect(profile.getAttribute('buttonVariant')).toBe('accent-secondary')
    })

    recentConnections?.forEach(profile => {
      expect(profile.getAttribute('buttonLabel')).toBe('Connect')
      expect(profile.getAttribute('buttonVariant')).toBe('neutral-secondary')
    })
  })
})

describe('W3mProfileWalletsView - Bitcoin Specific Behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.BITCOIN,
      activeCaipNetwork: mockBitcoinNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.BITCOIN,
          { namespace: ConstantsUtil.CHAIN.BITCOIN, caipNetworks: [mockBitcoinNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.BITCOIN]: 'bitcoin-wallet'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: []
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockBitcoinAddress as CaipAddress
    } as unknown as AccountState)
  })

  it('should render Bitcoin profile content with account types', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockBitcoinConnection],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const activeProfile = element.shadowRoot?.querySelector(ACTIVE_PROFILE_WALLET)
    expect(activeProfile).not.toBeNull()
  })
})

describe('W3mProfileWalletsView - Empty State', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: []
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
  })

  it('should render empty state when no connections exist', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const emptyState = element.shadowRoot?.querySelector('[data-testid="empty-template"]')
    expect(emptyState).not.toBeNull()

    const emptyText = element.shadowRoot?.querySelector('[data-testid="empty-state-text"]')
    expect(emptyText?.textContent).toBe('No wallet connected')

    const addButton = element.shadowRoot?.querySelector('[data-testid="empty-state-button"]')
    expect(addButton?.textContent?.trim()).toBe('Add EVM Wallet')
  })

  it('should show correct empty state messages for different namespaces', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.SOLANA,
      activeCaipNetwork: mockSolanaNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.SOLANA,
          { namespace: ConstantsUtil.CHAIN.SOLANA, caipNetworks: [mockSolanaNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const addButton = element.shadowRoot?.querySelector('[data-testid="empty-state-button"]')
    expect(addButton?.textContent?.trim()).toBe('Add Solana Wallet')

    const description = element.shadowRoot?.querySelector('[data-testid="empty-state-description"]')
    expect(description?.textContent).toBe('Add your first Solana wallet')
  })

  it('should not render add connection button when connections exist', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: []
    })

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const emptyState = element.shadowRoot?.querySelector('[data-testid="empty-template"]')
    expect(emptyState).toBeNull()

    const addConnectionItem = element.shadowRoot?.querySelector(
      '[data-testid="add-connection-button"]'
    )
    expect(addConnectionItem).not.toBeNull()
  })
})

describe('W3mProfileWalletsView - User Actions', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector]
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockEthereumAddress as CaipAddress
    } as unknown as AccountState)

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: [mockRecentConnection]
    })

    vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue()
    vi.spyOn(ConnectionController, 'switchConnection').mockResolvedValue()
    vi.spyOn(StorageUtil, 'deleteAddressFromConnection').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
    vi.spyOn(ConnectorController, 'setFilterByNamespace').mockImplementation(() => {})
    vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(() => {})
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(() => {})
  })

  it('should handle disconnect all action', async () => {
    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const disconnectAllLink = element.shadowRoot?.querySelector(
      '[data-testid="disconnect-all-button"]'
    )
    expect(disconnectAllLink).not.toBeNull()

    disconnectAllLink?.dispatchEvent(new Event('click'))

    expect(ConnectionController.disconnect).toHaveBeenCalledWith({
      namespace: ConstantsUtil.CHAIN.EVM
    })
  })

  it('should handle add connection action', async () => {
    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const addConnectionButton = element.shadowRoot?.querySelector(
      '[data-testid="add-connection-button"]'
    )
    expect(addConnectionButton).not.toBeNull()

    addConnectionButton?.dispatchEvent(new Event('click'))

    expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(ConstantsUtil.CHAIN.EVM)
    expect(RouterController.push).toHaveBeenCalledWith('Connect', {
      addWalletForNamespace: ConstantsUtil.CHAIN.EVM
    })
  })

  it('should handle copy address action', async () => {
    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const activeProfile = element.shadowRoot?.querySelector(ACTIVE_PROFILE_WALLET)
    expect(activeProfile).not.toBeNull()

    activeProfile?.dispatchEvent(new Event('copy'))

    expect(CoreHelperUtil.copyToClopboard).toHaveBeenCalledWith(
      '0x1234567890123456789012345678901234567890'
    )
    expect(SnackController.showSuccess).toHaveBeenCalledWith('Address copied')
  })

  it('should handle wallet switch action successfully', async () => {
    const mockActiveConnection: Connection = {
      connectorId: 'metamask',
      accounts: [{ address: '0x9876543210987654321098765432109876543210', type: 'smart' }]
    }

    vi.mocked(ConnectionControllerUtil.getConnectionsData).mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: []
    })

    const element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    await element.updateComplete

    const switchButton = element.shadowRoot?.querySelector('[data-testid="active-connection"]')

    expect(switchButton).not.toBeNull()

    switchButton?.dispatchEvent(new Event('buttonClick'))

    expect(ConnectionController.switchConnection).toHaveBeenCalledWith({
      connection: mockActiveConnection,
      address: '0x9876543210987654321098765432109876543210',
      namespace: 'eip155',
      closeModalOnConnect: false,
      onChange: expect.any(Function)
    })
  })

  it('should handle wallet delete action for recent connections', async () => {
    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const recentConnection = element.shadowRoot?.querySelector('[data-testid="recent-connection"]')

    expect(recentConnection).not.toBeNull()

    recentConnection?.dispatchEvent(new Event('iconClick'))

    expect(StorageUtil.deleteAddressFromConnection).toHaveBeenCalledWith({
      connectorId: mockRecentConnection.connectorId,
      address: mockRecentConnection.accounts[0]?.address,
      namespace: ConstantsUtil.CHAIN.EVM
    })
    expect(SnackController.showSuccess).toHaveBeenCalledWith('Wallet deleted')
  })
})

describe('W3mProfileWalletsView - Loading States', () => {
  beforeEach(() => {
    vi.resetAllMocks

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    } as unknown as ChainControllerState)

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector]
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
  })

  it('should show loading state when switching account', async () => {
    const mockActiveConnection: Connection = {
      connectorId: 'metamask',
      accounts: [{ address: '0x1234567890123456789012345678901234567890', type: 'eoa' }]
    }

    vi.mocked(ConnectionControllerUtil.getConnectionsData).mockReturnValue({
      connections: [mockActiveConnection],
      recentConnections: []
    })

    let resolveSwitchConnection: () => void
    const switchConnectionPromise = new Promise<void>(resolve => {
      resolveSwitchConnection = resolve
    })

    vi.mocked(ConnectionController.switchConnection).mockReturnValue(switchConnectionPromise)

    const element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    await element.updateComplete

    const switchButton = element.shadowRoot?.querySelector('[data-testid="active-connection"]')
    expect(switchButton).not.toBeNull()

    switchButton?.dispatchEvent(new Event('buttonClick'))

    await element.updateComplete

    const walletItems = element.shadowRoot?.querySelectorAll('[data-testid="active-connection"]')
    const loadingWallet = Array.from(walletItems || []).find(item => (item as any).loading === true)
    expect(loadingWallet).not.toBeNull()

    expect(ConnectionController.switchConnection).toHaveBeenCalledWith({
      connection: mockActiveConnection,
      address: '0x1234567890123456789012345678901234567890',
      namespace: 'eip155',
      closeModalOnConnect: false,
      onChange: expect.any(Function)
    })

    resolveSwitchConnection!()
    await switchConnectionPromise
  })

  it('should not show add wallet button when multiWallet is disabled and caipAddress is set', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: false }
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: mockEthereumAddress as CaipAddress
    } as unknown as AccountState)

    const element: W3mProfileWalletsView = await fixture(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )

    const addConnectionButton = element.shadowRoot?.querySelector(
      '[data-testid="add-connection-button"]'
    )

    expect(addConnectionButton).toBeNull()
  })
})

describe('W3mProfileWalletsView - onConnectionsChange', () => {
  let element: W3mProfileWalletsView

  beforeEach(async () => {
    vi.clearAllMocks()

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: ConstantsUtil.CHAIN.EVM,
      activeCaipNetwork: mockEthereumNetwork,
      chains: new Map([
        [
          ConstantsUtil.CHAIN.EVM,
          { namespace: ConstantsUtil.CHAIN.EVM, caipNetworks: [mockEthereumNetwork] }
        ]
      ])
    })
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnectorIds: {
        [ConstantsUtil.CHAIN.EVM]: 'metamask'
      } as unknown as Record<ChainNamespace, string | undefined>,
      connectors: [mockMetaMaskConnector, mockWalletConnectConnector, mockAuthConnector]
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      user: {}
    } as unknown as AccountState)
    vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    element = await fixture<W3mProfileWalletsView>(
      html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
    )
    element['remoteFeatures'] = { multiWallet: true }
    element['namespace'] = ConstantsUtil.CHAIN.EVM
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should call RouterController.reset when no connections found for current namespace', () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })
    element['onConnectionsChange']()
    expect(RouterController.reset).toHaveBeenCalledWith('ProfileWallets')
  })

  it('should call requestUpdate after handling connections', () => {
    const requestUpdateSpy = vi.spyOn(element, 'requestUpdate')
    element['onConnectionsChange']()
    expect(requestUpdateSpy).toHaveBeenCalled()
  })
})
