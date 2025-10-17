'use client';

/**
 * Polkadot Adapter for AppKit
 * 
 * Implements AppKit's AdapterBlueprint interface for Polkadot/Substrate chains.
 * Handles injected wallet extensions (SubWallet, Talisman, polkadot-js).
 */

import type UniversalProvider from '@walletconnect/universal-provider';
import { AdapterBlueprint } from '@reown/appkit-controllers';
import type {
  CaipNetwork,
  ChainNamespace,
  Connection,
} from '@reown/appkit-common';
import type {
  PolkadotProvider,
  PolkadotAccount,
  PolkadotWalletSource,
  InjectedAccountWithMeta,
} from './providers/PolkadotProvider.js';
import { PolkadotConnectorProvider } from './connectors/InjectedConnector.js';

// Dynamic imports for client-side only
let web3Enable: any;
let web3Accounts: any;
let web3FromAddress: any;
let ApiPromise: any;
let WsProvider: any;
let formatBalance: any;

// Load Polkadot libraries only on client-side
async function loadPolkadotLibs() {
  if (typeof window === 'undefined') {
    throw new Error('Polkadot libraries can only be loaded on the client');
  }
  
  if (!web3Enable) {
    const extensionDapp = await import('@polkadot/extension-dapp');
    web3Enable = extensionDapp.web3Enable;
    web3Accounts = extensionDapp.web3Accounts;
    web3FromAddress = extensionDapp.web3FromAddress;
  }
  
  if (!ApiPromise) {
    const api = await import('@polkadot/api');
    ApiPromise = api.ApiPromise;
    WsProvider = api.WsProvider;
  }
  
  if (!formatBalance) {
    const util = await import('@polkadot/util');
    formatBalance = util.formatBalance;
  }
}

/**
 * Polkadot connector type
 */
interface PolkadotConnector {
  id: string;
  type: string;
  name: string;
  imageUrl?: string;
  provider: PolkadotProvider;
  accounts: PolkadotAccount[];
  chains: CaipNetwork[];
  chain: string;
}

/**
 * Account selection callback type
 * Applications can provide a custom UI for account selection
 */
export type AccountSelectionCallback = (accounts: PolkadotAccount[]) => Promise<PolkadotAccount>;

/**
 * Options for initializing Polkadot adapter
 */
export interface PolkadotAdapterOptions {
  appName?: string;
  preferredWallets?: PolkadotWalletSource[];
  /**
   * Optional callback for account selection when multiple accounts exist
   * If not provided, the first account will be selected automatically
   */
  onSelectAccount?: AccountSelectionCallback;
}

/**
 * Polkadot AppKit Adapter
 * 
 * Extends AdapterBlueprint to provide Polkadot blockchain support
 */
export class PolkadotAdapter extends AdapterBlueprint<any> {
  private appName: string;
  private preferredWallets: PolkadotWalletSource[];
  private apiCache: Map<string, any> = new Map();
  private universalProvider?: UniversalProvider;
  private extensionsEnabled: boolean = false;
  private enablePromise?: Promise<any>;
  private onSelectAccount?: AccountSelectionCallback;

  constructor(options: PolkadotAdapterOptions = {}) {
    super({
      namespace: 'polkadot' as ChainNamespace,
      adapterType: 'polkadot-injected',
    });

    this.appName = options.appName || 'AppKit Polkadot';
    this.preferredWallets = options.preferredWallets || [
      'subwallet-js',
      'talisman',
      'polkadot-js',
    ];
    this.onSelectAccount = options.onSelectAccount;
    
    console.log('[PolkadotAdapter] CONSTRUCTED with options:', options);
    console.log('[PolkadotAdapter] namespace:', this.namespace);
    console.log('[PolkadotAdapter] adapterType:', this.adapterType);
  }

  /**
   * Ensure extensions are enabled (only call web3Enable once)
   */
  private async ensureExtensionsEnabled(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Polkadot adapter requires browser environment');
    }

    // Load libraries first
    await loadPolkadotLibs();

    if (this.extensionsEnabled) {
      return;
    }

    // If already enabling, wait for that promise
    if (this.enablePromise) {
      await this.enablePromise;
      return;
    }

    // Start enabling
    this.enablePromise = web3Enable(this.appName);
    
    try {
      const injectedExtensions = await this.enablePromise;
      if (injectedExtensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install SubWallet, Talisman, or polkadot-js');
      }
      this.extensionsEnabled = true;
      console.log('[PolkadotAdapter] Extensions enabled:', injectedExtensions.length);
    } finally {
      this.enablePromise = undefined;
    }
  }

  /**
   * Detect installed Polkadot wallets (required by AdapterBlueprint)
   * Called by AppKit to discover available wallet extensions
   */
  syncConnectors(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Check for injected Polkadot extensions via injectedWeb3
    // This is populated by Polkadot extensions (SubWallet, Talisman, polkadot-js)
    const injectedWeb3 = (window as any).injectedWeb3;
    
    if (!injectedWeb3) {
      console.log('[PolkadotAdapter] No injectedWeb3 found - no extensions installed');
      return;
    }

    // Detect which of our preferred wallets are actually installed
    const detectedWallets = this.preferredWallets.filter(source => {
      const extension = injectedWeb3[source];
      if (extension) {
        console.log(`[PolkadotAdapter] Detected ${source}:`, extension.version);
        return true;
      }
      return false;
    });

    if (detectedWallets.length === 0) {
      console.log('[PolkadotAdapter] No preferred wallets detected in injectedWeb3');
      console.log('[PolkadotAdapter] Available extensions:', Object.keys(injectedWeb3));
      return;
    }

    console.log('[PolkadotAdapter] Detected wallets:', detectedWallets);

    // Create proper connector instances for detected wallets
    // These tell AppKit which wallets are installed and provide connect functionality
    // IMPORTANT: Use AppKit-friendly IDs (subwallet, not subwallet-js)
    const sourceToIdMap: Record<string, string> = {
      'subwallet-js': 'subwallet',
      'talisman': 'talisman',
      'polkadot-js': 'polkadot',
    };
    
    const polkadotChains = this.getCaipNetworks('polkadot' as ChainNamespace);
    console.log('[PolkadotAdapter] Available Polkadot chains:', polkadotChains);
    console.log('[PolkadotAdapter] Chain count:', polkadotChains.length);
    console.log('[PolkadotAdapter] First chain:', polkadotChains[0]);
    console.log('[PolkadotAdapter] First chain properties:', {
      id: polkadotChains[0]?.id,
      name: polkadotChains[0]?.name,
      chainNamespace: polkadotChains[0]?.chainNamespace,
      caipNetworkId: polkadotChains[0]?.caipNetworkId,
    });
    
    const newConnectors = detectedWallets.map(source => {
      const walletId = sourceToIdMap[source] || source;
      
      // Create a proper connector class instance
      const connector = new PolkadotConnectorProvider({
        id: walletId, // Use AppKit-friendly ID
        source, // Keep internal source ID for connect logic
        name: this.getWalletName(source),
        imageUrl: this.getWalletIcon(source),
        chains: polkadotChains,
        chain: this.getDefaultChainId(),
        // Provide connect handler that delegates to adapter's connect method
        connectHandler: async (walletSource: PolkadotWalletSource) => {
          console.log(`[PolkadotAdapter] Connector ${walletId} connect() called`);
          return this.connect({
            id: walletSource, // Use source (subwallet-js) for internal logic
            type: 'INJECTED',
          } as any);
        },
      });
      
      console.log(`[PolkadotAdapter] Created connector for ${walletId}:`, {
        id: connector.id,
        name: connector.name,
        namespace: connector.namespace,
        chainCount: connector.chains.length,
      });
      console.log(`[PolkadotAdapter] Full chain details for ${walletId}:`, connector.chains);
      console.log(`[PolkadotAdapter] Chain namespaces:`, connector.chains.map(c => c.chainNamespace));
      
      return connector;
    });

    // Add connectors to adapter
    newConnectors.forEach(connector => {
      this.addConnector(connector as any);
    });

    console.log('[PolkadotAdapter] Registered connectors:', newConnectors.map(c => c.name));
    console.log('[PolkadotAdapter] Connector IDs:', newConnectors.map(c => c.id));

    // Emit connectors event to notify AppKit of available wallets
    this.emit('connectors', this.connectors);
  }

  // =============================================================================
  // Core Connection Methods
  // =============================================================================

  /**
   * Connect to a Polkadot wallet
   */
  async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    console.log('[PolkadotAdapter] ========================================');
    console.log('[PolkadotAdapter] CONNECT CALLED FROM USER ACTION');
    console.log('[PolkadotAdapter] Params:', JSON.stringify(params, null, 2));
    console.log('[PolkadotAdapter] Stack:', new Error().stack);
    console.log('[PolkadotAdapter] ========================================');
    
    try {

      // Ensure extensions are enabled (only calls web3Enable once)
      console.log('[PolkadotAdapter] Step 1: Enabling extensions...');
      await this.ensureExtensionsEnabled();
      console.log('[PolkadotAdapter] Step 1: Extensions enabled ✓');

      // Get accounts
      console.log('[PolkadotAdapter] Step 2: Getting accounts...');
      const injectedAccounts = await web3Accounts();
      console.log('[PolkadotAdapter] Step 2: Total accounts found:', injectedAccounts.length);
      console.log('[PolkadotAdapter] Step 2: Account sources:', injectedAccounts.map((a: InjectedAccountWithMeta) => a.meta.source));
      
      if (injectedAccounts.length === 0) {
        throw new Error('No accounts found in extension');
      }

      // Get the specific wallet's provider
      const source = this.getWalletSource(params.id);
      console.log('[PolkadotAdapter] Step 3: Filtering for source:', source);
      
      const accounts = injectedAccounts
        .filter((acc: InjectedAccountWithMeta) => acc.meta.source === source)
        .map((a: InjectedAccountWithMeta) => this.mapAccount(a));

      console.log('[PolkadotAdapter] Step 3: Accounts for this wallet:', accounts.length);
      console.log('[PolkadotAdapter] Step 3: Account addresses:', accounts.map((a: PolkadotAccount) => a.address));

      if (accounts.length === 0) {
        throw new Error(`No accounts found for ${params.id}`);
      }

      // Select account
      let selectedAccount: PolkadotAccount;
      if (params.address) {
        // Use specified address
        selectedAccount = accounts.find((a: PolkadotAccount) => a.address === params.address) || accounts[0];
        console.log('[PolkadotAdapter] Step 4: Using specified address:', selectedAccount.address);
      } else if (accounts.length === 1) {
        // Only one account, use it
        selectedAccount = accounts[0];
        console.log('[PolkadotAdapter] Step 4: Single account available:', selectedAccount.address);
      } else {
        // Multiple accounts - use callback or first account
        console.log('[PolkadotAdapter] Step 4: Multiple accounts detected');
        if (this.onSelectAccount) {
          try {
            selectedAccount = await this.onSelectAccount(accounts);
            console.log('[PolkadotAdapter] Step 4: User selected account:', selectedAccount.address);
          } catch (error) {
            console.log('[PolkadotAdapter] Step 4: Account selection cancelled or failed');
            throw new Error('Account selection cancelled');
          }
        } else {
          // No callback provided, use first account
          selectedAccount = accounts[0];
          console.log('[PolkadotAdapter] Step 4: Auto-selected first account:', selectedAccount.address);
        }
      }

      // Get provider for this account
      console.log('[PolkadotAdapter] Step 5: Getting injector for account...');
      const injector = await web3FromAddress(selectedAccount.address);
      console.log('[PolkadotAdapter] Step 5: Injector obtained ✓');
      console.log('[PolkadotAdapter] Step 5: Signer available:', !!injector.signer);
      console.log('[PolkadotAdapter] Step 5: signRaw available:', !!injector.signer?.signRaw);

      // Create connector
      const chainId = String(params.chainId || this.getDefaultChainId());
      const caipNetwork = this.getCaipNetworks('polkadot' as ChainNamespace).find(n => n.id === chainId) || this.getCaipNetworks('polkadot' as ChainNamespace)[0];
      const connector: PolkadotConnector = {
        id: params.id,
        type: 'INJECTED',
        name: this.getWalletName(source),
        imageUrl: this.getWalletIcon(source),
        provider: injector as unknown as PolkadotProvider,
        accounts,
        chains: caipNetwork ? [caipNetwork] : [],
        chain: chainId,
      };

      // Store connector
      console.log('[PolkadotAdapter] Step 6: Storing connector...');
      this.addConnector(connector);

      // Create connection with account
      const connection = {
        connectorId: params.id,
        chainId: String(chainId),
        accounts: [{ address: selectedAccount.address }],
        caipNetwork,
      } as Connection;

      this.addConnection(connection);
      console.log('[PolkadotAdapter] Step 6: Connector and connection stored ✓');
      
      // Emit accountChanged event so AppKit hooks update
      this.emit('accountChanged', {
        address: selectedAccount.address,
        chainId: String(chainId),
        connector: connector as any,
      });
      console.log('[PolkadotAdapter] Step 6b: accountChanged event emitted');

      // Emit connection event
      this.emit('connections', this.connections);

      const result: AdapterBlueprint.ConnectResult = {
        id: connector.id,
        type: 'INJECTED' as any,
        provider: connector.provider as any,
        chainId: String(chainId),
        address: selectedAccount.address,
        accounts: [] as any,
      };

      console.log('[PolkadotAdapter] ========================================');
      console.log('[PolkadotAdapter] ✅ CONNECTION SUCCESSFUL');
      console.log('[PolkadotAdapter] Result:', JSON.stringify(result, null, 2));
      console.log('[PolkadotAdapter] ========================================');

      return result;
    } catch (error) {
      console.error('[PolkadotAdapter] ========================================');
      console.error('[PolkadotAdapter] ❌ CONNECTION FAILED');
      console.error('[PolkadotAdapter] Error:', error);
      console.error('[PolkadotAdapter] Error stack:', (error as Error).stack);
      console.error('[PolkadotAdapter] ========================================');
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(
    params?: AdapterBlueprint.DisconnectParams
  ): Promise<AdapterBlueprint.DisconnectResult> {
    if (params?.id) {
      // Disconnect specific wallet
      this.deleteConnection(params.id);
      const connectorIndex = this.availableConnectors.findIndex((c: any) => c.id === params.id);
      if (connectorIndex >= 0) {
        this.availableConnectors.splice(connectorIndex, 1);
      }
    } else {
      // Disconnect all
      this.clearConnections();
      this.availableConnectors = [];
    }

    this.emit('connections', this.connections);

    return { connections: this.connections };
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
    const connector = this.connectors.find(c => c.id === params.id);
    if (!connector) {
      return { accounts: [] };
    }

    return {
      accounts: connector.accounts.map((acc: PolkadotAccount) => ({
        address: acc.address,
        type: 'eoa' as const,
        namespace: 'polkadot' as ChainNamespace,
      })),
    };
  }

  /**
   * Get balance for an address
   */
  async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    console.log('[PolkadotAdapter] getBalance called with:', params);
    
    if (!params.address || !params.caipNetwork) {
      console.error('[PolkadotAdapter] Missing required params:', { address: !!params.address, caipNetwork: !!params.caipNetwork });
      throw new Error('Address and caipNetwork are required');
    }

    try {
      console.log('[PolkadotAdapter] Getting API for balance check...');
      const api = await this.getApi(params.caipNetwork);
      console.log('[PolkadotAdapter] API obtained, querying account...');
      
      const accountInfo = await api.query.system.account(params.address);
      const data = (accountInfo as any).data;

      const free = data.free.toString();
      const decimals = api.registry.chainDecimals[0] || 10;
      const symbol = api.registry.chainTokens[0] || 'DOT';

      const formattedBalance = formatBalance(free, {
        decimals,
        withUnit: false,
      });

      console.log('[PolkadotAdapter] Balance fetched successfully:', { free, formattedBalance, symbol });

      return {
        balance: formattedBalance,
        symbol,
      };
    } catch (error) {
      console.error('[PolkadotAdapter] getBalance failed:', error);
      return {
        balance: '0',
        symbol: 'DOT',
      };
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
    );

    if (!connector) {
      throw new Error('No connector found for address');
    }

    const injector = await web3FromAddress(params.address);
    const signRaw = injector.signer?.signRaw;

    if (!signRaw) {
      throw new Error('Wallet does not support message signing');
    }

    // Ensure message is hex-encoded
    const data = params.message.startsWith('0x')
      ? params.message
      : `0x${Buffer.from(params.message).toString('hex')}`;

    const result = await signRaw({
      address: params.address,
      data,
      type: 'bytes',
    });

    return { signature: result.signature };
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    _params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    throw new Error('sendTransaction not yet implemented for Polkadot');
    // TODO: Implement using extrinsic building
  }

  // =============================================================================
  // Synchronization Methods
  // =============================================================================


  /**
   * Sync connections (restore previous connections)
   */
  override async syncConnections(
    _params: AdapterBlueprint.SyncConnectionsParams
  ): Promise<void> {
    // Skip on server-side
    if (typeof window === 'undefined') {
      return;
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
      rpcUrl: params.rpcUrl,
    } as any);
  }

  // =============================================================================
  // Utility & Stub Methods
  // =============================================================================

  /**
   * Set universal provider (required by AdapterBlueprint, but unused for injected wallets)
   * Polkadot uses browser extensions, not WalletConnect
   */
  async setUniversalProvider(universalProvider: any): Promise<void> {
    this.universalProvider = universalProvider;
  }

  async estimateGas(): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    throw new Error('estimateGas not applicable to Polkadot');
  }

  async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    throw new Error('writeContract not applicable to Polkadot');
  }

  parseUnits(params: AdapterBlueprint.ParseUnitsParams): bigint {
    return BigInt(Math.floor(parseFloat(params.value) * Math.pow(10, params.decimals)));
  }

  formatUnits(params: AdapterBlueprint.FormatUnitsParams): string {
    return (Number(params.value) / Math.pow(10, params.decimals)).toString();
  }

  /**
   * Get WalletConnect provider (required by AdapterBlueprint, but unused for injected wallets)
   * Returns null since Polkadot doesn't use WalletConnect in this adapter
   */
  getWalletConnectProvider(): any {
    return this.universalProvider || null;
  }

  async getCapabilities(): Promise<unknown> {
    return {};
  }

  async grantPermissions(): Promise<unknown> {
    return {};
  }

  async revokePermissions(): Promise<`0x${string}`> {
    return '0x0' as `0x${string}`;
  }

  async walletGetAssets(): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return {};
  }

  override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    // Polkadot extensions don't support programmatic network switching
    // Network is selected by user in extension UI
    console.log('[PolkadotAdapter] Network switch requested:', params.caipNetwork.name);
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
      genesisHash: account.meta.genesisHash as `0x${string}` | undefined,
    };
  }

  private getWalletSource(id: string): PolkadotWalletSource {
    console.log('[PolkadotAdapter] getWalletSource - input id:', id);
    
    const sourceMap: Record<string, PolkadotWalletSource> = {
      'subwallet': 'subwallet-js',
      'subwallet-js': 'subwallet-js',
      'talisman': 'talisman',
      'polkadot': 'polkadot-js',
      'polkadot-js': 'polkadot-js',
    };
    
    const source = sourceMap[id] || id as PolkadotWalletSource;
    console.log('[PolkadotAdapter] getWalletSource - mapped to source:', source);
    return source;
  }

  private getWalletName(source: string): string {
    const nameMap: Record<string, string> = {
      'subwallet-js': 'SubWallet',
      talisman: 'Talisman',
      'polkadot-js': 'Polkadot{.js}',
    };
    return nameMap[source] || source;
  }

  private getWalletIcon(source: string): string | undefined {
    const iconMap: Record<string, string> = {
      'subwallet-js': '/assets/wallets/subwallet.webp',
      talisman: '/assets/wallets/talisman.webp',
      'polkadot-js': '/assets/wallets/polkadot.webp',
    };
    return iconMap[source];
  }

  private getDefaultChainId(): string {
    // Default to Polkadot relay chain
    return '91b171bb158e2d3848fa23a9f1c25182';
  }

  private async getApi(caipNetwork: CaipNetwork): Promise<any> {
    console.log('[PolkadotAdapter] getApi called with caipNetwork:', caipNetwork);
    
    const cached = this.apiCache.get(String(caipNetwork.id));
    if (cached) {
      console.log('[PolkadotAdapter] Using cached API for:', caipNetwork.id);
      return cached;
    }

    const wsUrl = caipNetwork.rpcUrls.default.webSocket?.[0];
    console.log('[PolkadotAdapter] WebSocket URL:', wsUrl);
    
    if (!wsUrl) {
      console.error('[PolkadotAdapter] No WebSocket RPC URL configured for network:', caipNetwork);
      throw new Error('No WebSocket RPC URL configured for network');
    }

    try {
      console.log('[PolkadotAdapter] Creating API connection to:', wsUrl);
      const provider = new WsProvider(wsUrl);
      const api = await ApiPromise.create({ provider });
      
      console.log('[PolkadotAdapter] API created successfully for:', caipNetwork.id);
      this.apiCache.set(String(caipNetwork.id), api);
      return api;
    } catch (error) {
      console.error('[PolkadotAdapter] Failed to create API connection:', error);
      throw error;
    }
  }
}

