'use client'

/**
 * Polkadot Adapter for AppKit
 *
 * Implements AppKit's AdapterBlueprint interface for Polkadot/Substrate chains.
 * Handles injected wallet extensions (SubWallet, Talisman, polkadot-js).
 */
// Note: UniversalProvider not used - Polkadot only uses injected connectors, not WalletConnect
// import type UniversalProvider from '@walletconnect/universal-provider'
import type { CaipNetwork, ChainNamespace, Connection } from '@reown/appkit-common'
import { AdapterBlueprint } from '@reown/appkit-controllers'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'

import { PolkadotConnectorProvider } from './connectors/InjectedConnector.js'
import type {
  InjectedAccountWithMeta,
  PolkadotAccount,
  PolkadotProvider,
  PolkadotWalletSource
} from './providers/PolkadotProvider.js'

// Instance-scoped dynamic imports to avoid cross-test/global state leakage
type PolkadotLibs = {
  web3Enable: any
  web3Accounts: any
  web3AccountsSubscribe: any
  web3FromAddress: any
  ApiPromise: any
  WsProvider: any
  formatBalance: any
}

/**
 * Polkadot connector type
 */
interface PolkadotConnector {
  id: string
  type: string
  name: string
  imageId?: string
  explorerId?: string
  provider: PolkadotProvider
  accounts: PolkadotAccount[]
  chains: CaipNetwork[]
  chain: string
}

/**
 * Account selection callback type
 * Applications can provide a custom UI for account selection
 */
export type AccountSelectionCallback = (accounts: PolkadotAccount[]) => Promise<PolkadotAccount>

/**
 * Options for initializing Polkadot adapter
 */
export interface PolkadotAdapterOptions {
  appName?: string
  preferredWallets?: PolkadotWalletSource[]
  /**
   * Optional callback for account selection when multiple accounts exist
   * If not provided, the first account will be selected automatically
   */
  onSelectAccount?: AccountSelectionCallback
}

/**
 * Polkadot AppKit Adapter
 *
 * Extends AdapterBlueprint to provide Polkadot blockchain support
 */
export class PolkadotAdapter extends AdapterBlueprint<any> {
  private appName: string
  private preferredWallets: PolkadotWalletSource[]
  private apiCache: Map<string, any> = new Map()
  private balanceCache: Map<string, { balance: string; symbol: string; timestamp: number }> =
    new Map()
  // Note: universalProvider not used - Polkadot only uses injected connectors
  // private universalProvider?: UniversalProvider
  private extensionsEnabled: boolean = false
  private enablePromise?: Promise<void>
  private accountUnsubscribe?: () => void
  private onSelectAccount?: AccountSelectionCallback
  private libs?: PolkadotLibs
  private isConnecting: boolean = false

  constructor(options: PolkadotAdapterOptions = {}) {
    super({
      namespace: 'polkadot' as ChainNamespace,
      adapterType: 'polkadot-injected'
    })

    this.appName = options.appName || 'AppKit Polkadot'
    this.preferredWallets = options.preferredWallets || ['subwallet-js', 'talisman', 'polkadot-js']
    this.onSelectAccount = options.onSelectAccount

    console.log('[PolkadotAdapter] CONSTRUCTED with options:', options)
    console.log('[PolkadotAdapter] namespace:', this.namespace)
    console.log('[PolkadotAdapter] adapterType:', this.adapterType)
  }

  /**
   * Ensure extensions are enabled (only call web3Enable once)
   */
  private async ensureExtensionsEnabled(): Promise<void> {
    console.log('[PolkadotAdapter] ensureExtensionsEnabled() called')
    if (typeof window === 'undefined') {
      throw new Error('Polkadot adapter requires browser environment')
    }

    // Load libraries first (instance scoped)
    await this.loadPolkadotLibs()

    if (this.extensionsEnabled) {
      console.log('[PolkadotAdapter] Extensions already enabled, returning early')
      return
    }

    // If already enabling, wait for that promise
    if (this.enablePromise) {
      console.log('[PolkadotAdapter] Enable already in progress, waiting...')
      try {
        await this.enablePromise
        console.log('[PolkadotAdapter] Enable promise completed successfully')
        return
      } catch (error) {
        console.error('[PolkadotAdapter] Enable promise failed:', error)
        // Reset the promise so we can try again
        this.enablePromise = undefined
        throw error
      }
    }

    // Start enabling
    console.log('[PolkadotAdapter] Calling web3Enable() for the first time...')
    this.enablePromise = this.libs!.web3Enable(this.appName)

    try {
      const injectedExtensions = (await this.enablePromise) as unknown as any[]
      if (!injectedExtensions || injectedExtensions.length === 0) {
        throw new Error(
          'No Polkadot extension found. Please install SubWallet, Talisman, or polkadot-js'
        )
      }
      this.extensionsEnabled = true
      console.log('[PolkadotAdapter] Extensions enabled:', injectedExtensions.length)
    } catch (error) {
      console.error('[PolkadotAdapter] Failed to enable extensions:', error)
      this.extensionsEnabled = false
      throw error
    } finally {
      this.enablePromise = undefined
    }
  }

  /**
   * Load Polkadot libraries for this adapter instance
   */
  private async loadPolkadotLibs(): Promise<void> {
    if (this.libs) return
    const testLibs =
      typeof window !== 'undefined' ? (window as any).__appkitPolkadotLibs : undefined
    // Start with test libs when available
    this.libs = {
      web3Enable: testLibs?.web3Enable,
      web3Accounts: testLibs?.web3Accounts,
      web3AccountsSubscribe: testLibs?.web3AccountsSubscribe,
      web3FromAddress: testLibs?.web3FromAddress,
      ApiPromise: testLibs?.ApiPromise,
      WsProvider: testLibs?.WsProvider,
      formatBalance: testLibs?.formatBalance
    } as PolkadotLibs

    // Fill missing pieces via dynamic imports
    if (
      !this.libs.web3Enable ||
      !this.libs.web3Accounts ||
      !this.libs.web3FromAddress ||
      !this.libs.web3AccountsSubscribe
    ) {
      const extensionDapp = await import('@polkadot/extension-dapp')
      this.libs.web3Enable = this.libs.web3Enable || extensionDapp.web3Enable
      this.libs.web3Accounts = this.libs.web3Accounts || extensionDapp.web3Accounts
      this.libs.web3AccountsSubscribe =
        this.libs.web3AccountsSubscribe || extensionDapp.web3AccountsSubscribe
      this.libs.web3FromAddress = this.libs.web3FromAddress || extensionDapp.web3FromAddress
    }
    if (!this.libs.ApiPromise || !this.libs.WsProvider) {
      const api = await import('@polkadot/api')
      this.libs.ApiPromise = this.libs.ApiPromise || api.ApiPromise
      this.libs.WsProvider = this.libs.WsProvider || api.WsProvider
    }
    if (!this.libs.formatBalance) {
      const util = await import('@polkadot/util')
      this.libs.formatBalance = util.formatBalance
    }
  }

  /**
   * Setup account subscription to detect wallet account changes
   * Emits accountChanged events when user switches accounts in extension
   */
  private async setupAccountSubscription(connectorId: string): Promise<void> {
    // Clean up previous subscription
    if (this.accountUnsubscribe) {
      console.log('[PolkadotAdapter] Cleaning up previous account subscription')
      this.accountUnsubscribe()
      this.accountUnsubscribe = undefined
    }

    try {
      const source = this.getWalletSource(connectorId)
      console.log('[PolkadotAdapter] Setting up account subscription for:', source)

      this.accountUnsubscribe = await this.libs!.web3AccountsSubscribe(
        async (injected: InjectedAccountWithMeta[]) => {
          console.log('[PolkadotAdapter] Account change detected:', injected.length, 'accounts')

          const accounts = injected
            .filter(a => a.meta.source === source)
            .map(a => this.mapAccount(a))

          if (accounts.length === 0) {
            console.log('[PolkadotAdapter] No accounts for source:', source)
            return
          }

          // Find existing connection
          const connection = this.connections.find(c => c.connectorId === connectorId)

          if (connection) {
            // Update stored connection
            const updatedConnection = {
              ...connection,
              accounts: accounts.map(a => ({ address: a.address, type: a.type as any }))
            }
            this.addConnection(updatedConnection)

            // Emit accountChanged event with first account (like Solana/Bitcoin)
            const addr = accounts[0]?.address
            if (addr) {
              console.log('[PolkadotAdapter] Emitting accountChanged:', addr)
              this.emit('accountChanged', {
                address: addr,
                chainId: connection.caipNetwork?.id,
                connector: this.connectors.find(c => c.id === connectorId)
              })
              // Emit connections after accountChanged
              this.emit('connections', this.connections)
            }
          }
        }
      )

      console.log('[PolkadotAdapter] Account subscription established')
    } catch (error) {
      console.error('[PolkadotAdapter] Failed to setup account subscription:', error)
      // Ensure cleanup on error
      this.accountUnsubscribe = undefined
    }
  }

  /**
   * Detect installed Polkadot wallets (required by AdapterBlueprint)
   * Called by AppKit to discover available wallet extensions
   */
  syncConnectors(): void {
    console.log('[PolkadotAdapter] syncConnectors() called')
    if (typeof window === 'undefined') {
      console.log('[PolkadotAdapter] window is undefined, skipping')
      return
    }
    console.log('[PolkadotAdapter] window is defined, proceeding')

    // Check for injected Polkadot extensions via injectedWeb3
    // This is populated by Polkadot extensions (SubWallet, Talisman, polkadot-js)
    const injectedWeb3 = (window as any).injectedWeb3

    if (!injectedWeb3) {
      console.log('[PolkadotAdapter] No injectedWeb3 found - no extensions installed')
      console.log(
        '[PolkadotAdapter] window keys:',
        Object.keys(window).filter(
          k => k.includes('wallet') || k.includes('polkadot') || k.includes('subwallet')
        )
      )
      return
    }

    console.log('[PolkadotAdapter] All injectedWeb3 extensions:', Object.keys(injectedWeb3))

    // Detect which of our preferred wallets are actually installed
    // Sort to ensure deterministic order
    const detectedWallets = this.preferredWallets
      .filter(source => {
        const extension = injectedWeb3[source]
        if (extension) {
          console.log(`[PolkadotAdapter] Detected ${source}:`, extension.version)
          return true
        }
        return false
      })
      .sort() // Alphabetical order for consistent UI

    if (detectedWallets.length === 0) {
      console.log('[PolkadotAdapter] No preferred wallets detected in injectedWeb3')
      console.log('[PolkadotAdapter] Available extensions:', Object.keys(injectedWeb3))
      return
    }

    console.log('[PolkadotAdapter] Detected wallets:', detectedWallets)

    // Create proper connector instances for detected wallets
    // These tell AppKit which wallets are installed and provide connect functionality
    // Map injected sources to AppKit wallet IDs and constants
    const sourceToWalletMap: Record<string, { id: string; walletName: string }> = {
      'subwallet-js': {
        id: 'subwallet',
        walletName: ConstantsUtil.SUBWALLET_CONNECTOR_NAME
      },
      talisman: {
        id: 'talisman',
        walletName: ConstantsUtil.TALISMAN_CONNECTOR_NAME
      },
      'polkadot-js': {
        id: 'polkadot',
        walletName: ConstantsUtil.POLKADOT_JS_CONNECTOR_NAME
      }
    }

    const polkadotChains = this.getCaipNetworks('polkadot' as ChainNamespace)
    console.log('[PolkadotAdapter] Available Polkadot chains:', polkadotChains)
    console.log('[PolkadotAdapter] Chain count:', polkadotChains.length)
    console.log('[PolkadotAdapter] First chain:', polkadotChains[0])
    console.log('[PolkadotAdapter] First chain properties:', {
      id: polkadotChains[0]?.id,
      name: polkadotChains[0]?.name,
      chainNamespace: polkadotChains[0]?.chainNamespace,
      caipNetworkId: polkadotChains[0]?.caipNetworkId
    })

    const newConnectors = detectedWallets.map(source => {
      const walletMapping = sourceToWalletMap[source]
      const walletId = walletMapping?.id || source
      const walletName = walletMapping?.walletName || source

      // Create a proper connector class instance
      const connector = new PolkadotConnectorProvider({
        id: walletId, // Use AppKit-friendly ID
        source, // Keep internal source ID for connect logic
        name: walletName,
        imageId: PresetsUtil.ConnectorImageIds[walletName],
        explorerId: PresetsUtil.ConnectorExplorerIds[walletName],
        chains: polkadotChains,
        // Use namespace for ConnectorController filtering (not CAIP-2 ID)
        chain: this.namespace as string,
        // Provide connect handler that delegates to adapter's connect method
        connectHandler: async (walletSource: PolkadotWalletSource) => {
          console.log(`[PolkadotAdapter] Connector ${walletId} connect() called`)
          return this.connect({
            id: walletSource, // Use source (subwallet-js) for internal logic
            type: 'INJECTED'
          } as any)
        }
      })

      console.log(`[PolkadotAdapter] Created connector for ${walletId}:`, {
        id: connector.id,
        name: connector.name,
        namespace: connector.namespace,
        chainCount: connector.chains.length
      })
      console.log(`[PolkadotAdapter] Full chain details for ${walletId}:`, connector.chains)
      console.log(
        `[PolkadotAdapter] Chain namespaces:`,
        connector.chains.map(c => c.chainNamespace)
      )

      return connector
    })

    // Add connectors to adapter
    newConnectors.forEach(connector => {
      this.addConnector(connector as any)
    })

    console.log(
      '[PolkadotAdapter] Registered connectors:',
      newConnectors.map(c => c.name)
    )
    console.log(
      '[PolkadotAdapter] Connector IDs:',
      newConnectors.map(c => c.id)
    )

    // Emit connectors event to notify AppKit of available wallets
    this.emit('connectors', this.connectors)
  }

  // =============================================================================
  // Core Connection Methods
  // =============================================================================

  /**
   * Connect to a Polkadot wallet
   */
  async connect(params: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult> {
    console.log('[PolkadotAdapter] ========================================')
    console.log('[PolkadotAdapter] CONNECT CALLED FROM USER ACTION')
    console.log('[PolkadotAdapter] Params:', {
      id: params.id,
      type: params.type,
      chainId: params.chainId,
      address: params.address
    })
    console.log('[PolkadotAdapter] extensionsEnabled:', this.extensionsEnabled)
    console.log('[PolkadotAdapter] enablePromise exists:', !!this.enablePromise)
    console.log('[PolkadotAdapter] isConnecting:', this.isConnecting)
    console.log('[PolkadotAdapter] Stack:', new Error().stack)
    console.log('[PolkadotAdapter] ========================================')

    try {
      // Prevent concurrent connection attempts
      if (this.isConnecting) {
        throw new Error(
          'Connection already in progress. Please wait for the current connection to complete.'
        )
      }
      this.isConnecting = true

      // Check for existing connection first (like Bitcoin/Solana adapters)
      const existingConnection = this.getConnection({
        address: params.address,
        connectorId: params.id,
        connections: this.connections,
        connectors: this.connectors
      })

      if (existingConnection?.account) {
        console.log('[PolkadotAdapter] Existing connection found, returning early')
        const connector = this.connectors.find(c => c.id === params.id)
        this.emit('accountChanged', {
          address: existingConnection.account.address,
          chainId: existingConnection.caipNetwork?.id,
          connector
        })
        this.isConnecting = false
        return {
          id: params.id,
          type: 'INJECTED' as any,
          provider: connector?.provider as any,
          chainId: String(existingConnection.caipNetwork?.id || this.getDefaultChainId()),
          address: existingConnection.account.address,
          accounts: [] as any
        }
      }

      // Clean up any existing connections for this wallet before connecting
      this.deleteConnection(params.id)
      console.log('[PolkadotAdapter] Cleaned up existing connections for:', params.id)

      // Ensure extensions are enabled (only calls web3Enable once)
      console.log('[PolkadotAdapter] Step 1: Enabling extensions...')
      await this.ensureExtensionsEnabled()
      console.log('[PolkadotAdapter] Step 1: Extensions enabled ✓')

      // Get accounts
      console.log('[PolkadotAdapter] Step 2: Getting accounts...')
      const injectedAccounts = await this.libs!.web3Accounts()
      console.log('[PolkadotAdapter] Step 2: Total accounts found:', injectedAccounts.length)
      console.log(
        '[PolkadotAdapter] Step 2: Account sources:',
        injectedAccounts.map((a: InjectedAccountWithMeta) => a.meta.source)
      )

      if (injectedAccounts.length === 0) {
        throw new Error('No accounts found in extension')
      }

      // Get the specific wallet's provider
      const source = this.getWalletSource(params.id)
      console.log('[PolkadotAdapter] Step 3: Filtering for source:', source)

      const accounts = injectedAccounts
        .filter((acc: InjectedAccountWithMeta) => acc.meta.source === source)
        .map((a: InjectedAccountWithMeta) => this.mapAccount(a))

      console.log('[PolkadotAdapter] Step 3: Accounts for this wallet:', accounts.length)
      console.log(
        '[PolkadotAdapter] Step 3: Account addresses:',
        accounts.map((a: PolkadotAccount) => a.address)
      )

      if (accounts.length === 0) {
        throw new Error(`No accounts found for ${params.id}`)
      }

      // Select account
      let selectedAccount: PolkadotAccount
      if (params.address) {
        // Use specified address
        selectedAccount =
          accounts.find((a: PolkadotAccount) => a.address === params.address) || accounts[0]
        console.log('[PolkadotAdapter] Step 4: Using specified address:', selectedAccount.address)
      } else if (accounts.length === 1) {
        // Only one account, use it
        selectedAccount = accounts[0]
        console.log('[PolkadotAdapter] Step 4: Single account available:', selectedAccount.address)
      } else {
        // Multiple accounts - use callback or first account
        console.log('[PolkadotAdapter] Step 4: Multiple accounts detected')
        if (this.onSelectAccount) {
          try {
            selectedAccount = await this.onSelectAccount(accounts)
            console.log('[PolkadotAdapter] Step 4: User selected account:', selectedAccount.address)

            // Validate that selected account is in the filtered list
            const isValid = accounts.some(
              (a: PolkadotAccount) => a.address === selectedAccount.address
            )
            if (!isValid) {
              console.error('[PolkadotAdapter] Step 4: Selected account not in available accounts')
              throw new Error('Selected account not found in wallet')
            }
          } catch (error) {
            console.log('[PolkadotAdapter] Step 4: Account selection cancelled or failed')
            throw new Error('Account selection cancelled')
          }
        } else {
          // No callback provided, use first account
          selectedAccount = accounts[0]
          console.log(
            '[PolkadotAdapter] Step 4: Auto-selected first account:',
            selectedAccount.address
          )
        }
      }

      // Get wallet metadata from mapping
      const walletMetadataMap: Record<
        string,
        { name: string; imageId?: string; explorerId?: string }
      > = {
        'subwallet-js': {
          name: ConstantsUtil.SUBWALLET_CONNECTOR_NAME,
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.SUBWALLET_CONNECTOR_NAME],
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.SUBWALLET_CONNECTOR_NAME]
        },
        talisman: {
          name: ConstantsUtil.TALISMAN_CONNECTOR_NAME,
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.TALISMAN_CONNECTOR_NAME],
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.TALISMAN_CONNECTOR_NAME]
        },
        'polkadot-js': {
          name: ConstantsUtil.POLKADOT_JS_CONNECTOR_NAME,
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.POLKADOT_JS_CONNECTOR_NAME],
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.POLKADOT_JS_CONNECTOR_NAME]
        }
      }
      const walletMetadata = walletMetadataMap[source] || {
        name: source,
        imageId: undefined,
        explorerId: undefined
      }

      // Create connector
      const chainId = String(params.chainId || this.getDefaultChainId())
      const caipNetwork =
        this.getCaipNetworks('polkadot' as ChainNamespace).find(n => n.id === chainId) ||
        this.getCaipNetworks('polkadot' as ChainNamespace)[0]
      const connector: PolkadotConnector = {
        id: params.id,
        type: 'INJECTED',
        name: walletMetadata.name,
        imageId: walletMetadata.imageId,
        explorerId: walletMetadata.explorerId,
        // Defer injector retrieval to signing time to avoid unnecessary extension calls
        provider: {} as unknown as PolkadotProvider,
        accounts,
        chains: caipNetwork ? [caipNetwork] : [],
        chain: chainId
      }

      // Store connector
      console.log('[PolkadotAdapter] Step 6: Storing connector...')
      this.addConnector(connector)

      // Create connection with account
      const connection = {
        connectorId: params.id,
        chainId: String(chainId),
        accounts: [{ address: selectedAccount.address }],
        caipNetwork
      } as Connection

      this.addConnection(connection)
      console.log('[PolkadotAdapter] Step 6: Connector and connection stored ✓')

      // Emit accountChanged event first (like Solana/Bitcoin adapters)
      this.emit('accountChanged', {
        address: selectedAccount.address,
        chainId: String(chainId),
        connector: connector as any
      })
      console.log('[PolkadotAdapter] Step 6b: accountChanged event emitted')

      // Emit connections event after accountChanged
      this.emit('connections', this.connections)
      console.log('[PolkadotAdapter] Step 6c: connections event emitted')

      // Setup account subscription for this wallet
      console.log('[PolkadotAdapter] Step 7: Setting up account subscription...')
      await this.setupAccountSubscription(params.id)
      console.log('[PolkadotAdapter] Step 7: Account subscription ready ✓')

      const result: AdapterBlueprint.ConnectResult = {
        id: connector.id,
        type: 'INJECTED' as any,
        provider: connector.provider as any,
        chainId: String(chainId),
        address: selectedAccount.address,
        accounts: [] as any
      }

      console.log('[PolkadotAdapter] ========================================')
      console.log('[PolkadotAdapter] ✅ CONNECTION SUCCESSFUL')
      console.log('[PolkadotAdapter] Result:', {
        id: result.id,
        type: result.type,
        chainId: result.chainId,
        address: result.address,
        accountsLength: result.accounts?.length || 0
      })
      console.log('[PolkadotAdapter] ========================================')

      return result
    } catch (error) {
      console.error('[PolkadotAdapter] ========================================')
      console.error('[PolkadotAdapter] ❌ CONNECTION FAILED')
      console.error('[PolkadotAdapter] Error:', error)
      console.error('[PolkadotAdapter] Error stack:', (error as Error).stack)
      console.error('[PolkadotAdapter] ========================================')
      throw error
    } finally {
      // Always reset connection state
      this.isConnecting = false
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    console.log('[PolkadotAdapter] disconnect called with params:', params)

    if (params?.id) {
      // Disconnect specific wallet
      console.log('[PolkadotAdapter] Disconnecting specific wallet:', params.id)
      this.deleteConnection(params.id)
      const connectorIndex = this.availableConnectors.findIndex((c: any) => c.id === params.id)
      if (connectorIndex >= 0) {
        this.availableConnectors.splice(connectorIndex, 1)
      }

      // Clean up account subscription if this was the last connection
      if (this.connections.length === 0) {
        console.log('[PolkadotAdapter] Last connection removed, cleaning up subscription')
        this.accountUnsubscribe?.()
        this.accountUnsubscribe = undefined
      }
    } else {
      // Disconnect all
      console.log('[PolkadotAdapter] Disconnecting all wallets')
      this.clearConnections()
      this.availableConnectors = []

      // Clean up account subscription when disconnecting all
      if (this.accountUnsubscribe) {
        console.log('[PolkadotAdapter] Cleaning up account subscription')
        this.accountUnsubscribe()
        this.accountUnsubscribe = undefined
      }
    }

    // Emit connections update
    this.emit('connections', this.connections)

    // Emit disconnect event if no connections remain
    if (this.connections.length === 0) {
      console.log('[PolkadotAdapter] No connections remaining, emitting disconnect event')
      this.emit('disconnect')
    }

    return { connections: this.connections }
  }

  // =============================================================================
  // Account & Balance Methods
  // =============================================================================

  /**
   * Get accounts for a connector
   */
  async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      return { accounts: [] }
    }

    return {
      accounts: connector.accounts.map((acc: PolkadotAccount) => ({
        address: acc.address,
        // Preserve actual type (sr25519, ed25519, or ecdsa)
        type: (acc.type ?? 'sr25519') as any,
        namespace: 'polkadot' as ChainNamespace
      }))
    }
  }

  /**
   * Get balance for an address
   */
  async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    console.log('[PolkadotAdapter] getBalance called with:', params)

    if (!params.address || !params.caipNetwork) {
      console.error('[PolkadotAdapter] Missing required params:', {
        address: !!params.address,
        caipNetwork: !!params.caipNetwork
      })
      throw new Error('Address and caipNetwork are required')
    }

    // Create cache key: network:address
    const cacheKey = `${params.caipNetwork.caipNetworkId}:${params.address}`
    const CACHE_TTL = 10000 // 10 seconds

    // Check cache
    const cached = this.balanceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[PolkadotAdapter] Returning cached balance')
      return { balance: cached.balance, symbol: cached.symbol }
    }

    try {
      await this.loadPolkadotLibs()
      console.log('[PolkadotAdapter] Getting API for balance check...')
      const api = await this.getApi(params.caipNetwork)
      console.log('[PolkadotAdapter] API obtained, querying account...')

      const accountInfo = await api.query.system.account(params.address)
      const data = (accountInfo as any).data

      // Handle empty/non-existent accounts (below existential deposit)
      const free = data?.free ? data.free.toString() : '0'
      const decimals = api.registry.chainDecimals[0] || 10
      const symbol = api.registry.chainTokens[0] || 'DOT'

      const formattedBalance = this.libs!.formatBalance(free, {
        decimals,
        withUnit: false
      })

      console.log('[PolkadotAdapter] Balance fetched successfully:', {
        free,
        formattedBalance,
        symbol
      })

      // Cache the result
      this.balanceCache.set(cacheKey, {
        balance: formattedBalance,
        symbol,
        timestamp: Date.now()
      })

      return {
        balance: formattedBalance,
        symbol
      }
    } catch (error) {
      console.error('[PolkadotAdapter] getBalance failed:', error)
      // Return correct symbol for the network, not hardcoded DOT
      const symbol = params.caipNetwork?.nativeCurrency?.symbol || 'DOT'
      return {
        balance: '0',
        symbol
      }
    }
  }

  // =============================================================================
  // Signing Methods
  // =============================================================================

  /**
   * Sign a message
   */
  async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const connector = this.connectors.find((c: any) =>
      c.accounts.some((a: PolkadotAccount) => a.address === params.address)
    )

    if (!connector) {
      throw new Error('No connector found for address')
    }

    // Prefer latest test-provided function when present to avoid stale refs in tests
    const web3From =
      (typeof window !== 'undefined' && (window as any).__appkitPolkadotLibs?.web3FromAddress) ||
      this.libs!.web3FromAddress
    const injector = await web3From(params.address)

    if (!injector.signer) {
      throw new Error('Signer not available for this address')
    }

    const signRaw = injector.signer.signRaw
    if (!signRaw) {
      throw new Error('Wallet does not support message signing (signRaw)')
    }

    // Ensure message is hex-encoded
    // Use TextEncoder for browser compatibility (Buffer not available without polyfill)
    const data = params.message.startsWith('0x')
      ? params.message
      : `0x${Array.from(new TextEncoder().encode(params.message))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}`

    const result = await signRaw({
      address: params.address,
      data,
      type: 'bytes'
    })

    return { signature: result.signature }
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    _params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    throw new Error('sendTransaction not yet implemented for Polkadot')
    // TODO: Implement using extrinsic building
  }

  // =============================================================================
  // Synchronization Methods
  // =============================================================================

  /**
   * Sync connections (restore previous connections)
   */
  override async syncConnections(_params: AdapterBlueprint.SyncConnectionsParams): Promise<void> {
    // Skip on server-side
    if (typeof window === 'undefined') {
      return
    }

    // Note: Consumers can implement persistent connection restoration
    // by storing connection info and calling connect() on initialization
  }

  /**
   * Sync a specific connection
   */
  async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({
      id: params.id,
      type: 'INJECTED',
      chainId: String(params.chainId),
      rpcUrl: params.rpcUrl
    } as any)
  }

  // =============================================================================
  // Utility & Stub Methods
  // =============================================================================

  /**
   * Set universal provider (required by AdapterBlueprint, but unused for injected wallets)
   * Polkadot uses browser extensions, not WalletConnect
   *
   * NOTE: We don't store the universal provider because Polkadot adapter
   * only uses injected connectors (browser extensions), not WalletConnect
   */
  async setUniversalProvider(_universalProvider: any): Promise<void> {
    // Intentionally not storing - prevents WalletConnect connector creation
    // Prefixed with _ to indicate intentionally unused
    console.log('[PolkadotAdapter] setUniversalProvider called but ignored (injected only)')
  }

  async estimateGas(): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    throw new Error('estimateGas not applicable to Polkadot')
  }

  async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    throw new Error('writeContract not applicable to Polkadot')
  }

  parseUnits(params: AdapterBlueprint.ParseUnitsParams): bigint {
    return BigInt(Math.floor(parseFloat(params.value) * Math.pow(10, params.decimals)))
  }

  formatUnits(params: AdapterBlueprint.FormatUnitsParams): string {
    return (Number(params.value) / Math.pow(10, params.decimals)).toString()
  }

  /**
   * Get WalletConnect provider (required by AdapterBlueprint, but unused for injected wallets)
   * Returns null since Polkadot doesn't use WalletConnect in this adapter
   *
   * IMPORTANT: Returning null tells AppKit to NOT create WalletConnect connectors
   * for Polkadot wallets. They should only use injected connectors.
   */
  getWalletConnectProvider(): any {
    // Always return null - Polkadot adapter only uses injected connectors
    // This prevents AppKit from trying to create WalletConnect connectors
    return null
  }

  async getCapabilities(): Promise<unknown> {
    return {}
  }

  async grantPermissions(): Promise<unknown> {
    return {}
  }

  async revokePermissions(): Promise<`0x${string}`> {
    return '0x0' as `0x${string}`
  }

  async walletGetAssets(): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return {}
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    // Polkadot extensions don't support programmatic network switching
    // Network is selected by user in extension UI
    console.log('[PolkadotAdapter] Network switch requested:', params.caipNetwork.name)
  }

  /**
   * Reset adapter state completely (useful for testing or error recovery)
   */
  resetAdapterState(): void {
    console.log('[PolkadotAdapter] Resetting adapter state')

    // Clean up subscriptions
    if (this.accountUnsubscribe) {
      this.accountUnsubscribe()
      this.accountUnsubscribe = undefined
    }

    // Reset connection state
    this.isConnecting = false
    this.enablePromise = undefined

    // Clear caches
    this.apiCache.clear()
    this.balanceCache.clear()

    // Clear connections and connectors
    this.clearConnections()
    this.availableConnectors = []

    console.log('[PolkadotAdapter] Adapter state reset complete')
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private mapAccount(account: InjectedAccountWithMeta): PolkadotAccount {
    return {
      address: account.address,
      name: account.meta.name,
      source: account.meta.source,
      type: account.type || 'sr25519',
      genesisHash: account.meta.genesisHash as `0x${string}` | undefined
    }
  }

  private getWalletSource(id: string): PolkadotWalletSource {
    console.log('[PolkadotAdapter] getWalletSource - input id:', id)

    const sourceMap: Record<string, PolkadotWalletSource> = {
      subwallet: 'subwallet-js',
      'subwallet-js': 'subwallet-js',
      talisman: 'talisman',
      polkadot: 'polkadot-js',
      'polkadot-js': 'polkadot-js'
    }

    const source = sourceMap[id] || (id as PolkadotWalletSource)
    console.log('[PolkadotAdapter] getWalletSource - mapped to source:', source)
    return source
  }

  private getDefaultChainId(): string {
    // Default to Polkadot relay chain
    return '91b171bb158e2d3848fa23a9f1c25182'
  }

  /**
   * Resolve WebSocket URL for Substrate chains
   * Prefers webSocket endpoints, falls back to wss:// http URLs
   */
  private resolveWsUrl(network: CaipNetwork): string | undefined {
    const defaultRpc = network.rpcUrls?.default as any
    const publicRpc = (network.rpcUrls as any)?.public

    // Prefer default.webSocket
    const wsUrl = defaultRpc?.webSocket?.[0] || publicRpc?.webSocket?.[0]
    if (wsUrl) return wsUrl

    // Fallback: check if http URL is actually wss://
    const httpUrl = defaultRpc?.http?.[0] || publicRpc?.http?.[0]
    if (httpUrl?.startsWith('wss://')) return httpUrl

    return undefined
  }

  private async getApi(caipNetwork: CaipNetwork): Promise<any> {
    console.log('[PolkadotAdapter] getApi called with caipNetwork:', caipNetwork)

    const cached = this.apiCache.get(String(caipNetwork.id))
    if (cached) {
      console.log('[PolkadotAdapter] Using cached API for:', caipNetwork.id)
      return cached
    }

    const wsUrl = this.resolveWsUrl(caipNetwork)
    console.log('[PolkadotAdapter] Resolved WebSocket URL:', wsUrl)

    if (!wsUrl) {
      console.error('[PolkadotAdapter] No WebSocket RPC URL configured for network:', caipNetwork)
      throw new Error('No WebSocket RPC URL configured for Substrate network')
    }

    try {
      console.log('[PolkadotAdapter] Creating API connection to:', wsUrl)
      const provider = new this.libs!.WsProvider(wsUrl)
      const api = await this.libs!.ApiPromise.create({ provider })

      console.log('[PolkadotAdapter] API created successfully for:', caipNetwork.id)
      this.apiCache.set(String(caipNetwork.id), api)
      return api
    } catch (error) {
      console.error('[PolkadotAdapter] Failed to create API connection:', error)
      throw error
    }
  }
}
