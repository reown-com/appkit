import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import type { Commitment, ConnectionConfig } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import UniversalProvider from '@walletconnect/universal-provider'
import bs58 from 'bs58'

import { type AppKit, type AppKitOptions, WcHelpersUtil } from '@reown/appkit'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AlertController,
  ChainController,
  CoreHelperUtil,
  type Provider as CoreProvider,
  StorageUtil
} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'
import { HelpersUtil } from '@reown/appkit-utils'
import { SolConstantsUtil } from '@reown/appkit-utils/solana'
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { AdapterBlueprint } from '@reown/appkit/adapters'

import { AuthProvider } from './providers/AuthProvider.js'
import {
  CoinbaseWalletProvider,
  type SolanaCoinbaseWallet
} from './providers/CoinbaseWalletProvider.js'
import { SolanaWalletConnectProvider } from './providers/SolanaWalletConnectProvider.js'
import { SolStoreUtil } from './utils/SolanaStoreUtil.js'
import { createSendTransaction } from './utils/createSendTransaction.js'
import { watchStandard } from './utils/watchStandard.js'

export interface AdapterOptions {
  connectionSettings?: Commitment | ConnectionConfig
  wallets?: BaseWalletAdapter[]
}

const IGNORED_CONNECTIONS_IDS: string[] = [
  CommonConstantsUtil.CONNECTOR_ID.AUTH,
  CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
]

export class SolanaAdapter extends AdapterBlueprint<SolanaProvider> {
  private connectionSettings: Commitment | ConnectionConfig
  public wallets?: BaseWalletAdapter[]
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}
  private universalProvider: UniversalProvider | undefined

  constructor(options: AdapterOptions = {}) {
    super({
      adapterType: CommonConstantsUtil.ADAPTER_TYPES.SOLANA,
      namespace: CommonConstantsUtil.CHAIN.SOLANA
    })
    this.connectionSettings = options.connectionSettings || 'confirmed'
    this.wallets = options.wallets
  }

  public override construct(params: AdapterBlueprint.Params): void {
    super.construct(params)
    const connectedCaipNetwork = StorageUtil.getActiveCaipNetworkId()
    const caipNetwork =
      params.networks?.find(n => n.caipNetworkId === connectedCaipNetwork) || params.networks?.[0]
    const rpcUrl = caipNetwork?.rpcUrls.default.http[0] as string
    if (rpcUrl) {
      SolStoreUtil.setConnection(new Connection(rpcUrl, this.connectionSettings))
    }
  }

  public override setAuthProvider(w3mFrameProvider: W3mFrameProvider) {
    this.addConnector(
      new AuthProvider({
        w3mFrameProvider,
        getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace),
        chains: this.getCaipNetworks()
      })
    )
  }

  override syncConnectors(options: AppKitOptions, appKit: AppKit) {
    if (!options.projectId) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
    }

    const getActiveChain = () => appKit.getCaipNetwork(this.namespace)

    // Add Coinbase Wallet if available
    if (CoreHelperUtil.isClient() && 'coinbaseSolana' in window) {
      this.addConnector(
        new CoinbaseWalletProvider({
          provider: window.coinbaseSolana as SolanaCoinbaseWallet,
          chains: this.getCaipNetworks(),
          getActiveChain
        })
      )
    }

    // Watch for standard wallet adapters
    watchStandard(this.getCaipNetworks(), getActiveChain, this.addConnector.bind(this))
  }

  // -- Transaction methods ---------------------------------------------------
  /**
   *
   * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
   * These function definition is to have a type parity between the clients. Currently not in use.
   */
  // eslint-disable-next-line @typescript-eslint/require-await

  public async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    return Promise.resolve({
      hash: ''
    })
  }

  public async getCapabilities(): Promise<unknown> {
    return Promise.resolve({})
  }

  public async grantPermissions(): Promise<unknown> {
    return Promise.resolve({})
  }

  public async revokePermissions(): Promise<`0x${string}`> {
    return Promise.resolve('0x')
  }

  public override async walletGetAssets(
    _params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return Promise.resolve({})
  }

  public async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    if (!connector) {
      return { accounts: [] }
    }

    return { accounts: await connector.getAccounts() }
  }

  public async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const provider = params.provider as SolanaProvider
    if (!provider) {
      throw new Error('connectionControllerClient:signMessage - provider is undefined')
    }

    const signature = await provider.signMessage(new TextEncoder().encode(params.message))

    return {
      signature: bs58.encode(signature)
    }
  }

  public async estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    const connection = SolStoreUtil.state.connection

    if (!connection || !params.provider) {
      throw new Error('Connection is not set')
    }

    const transaction = await createSendTransaction({
      provider: params.provider as SolanaProvider,
      connection,
      to: '11111111111111111111111111111111',
      value: 1
    })

    const fee = await transaction.getEstimatedFee(connection)

    return {
      gas: BigInt(fee || 0)
    }
  }

  public async sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    const connection = SolStoreUtil.state.connection

    if (!connection || !params.provider) {
      throw new Error('Connection is not set')
    }

    const provider = params.provider as SolanaProvider

    const transaction = await createSendTransaction({
      provider,
      connection,
      to: params.to,
      value: Number.isNaN(Number(params.value)) ? 0 : Number(params.value)
    })

    const result = await provider.sendTransaction(transaction, connection)

    await new Promise<void>(resolve => {
      const interval = setInterval(async () => {
        const status = await connection.getSignatureStatus(result)

        if (status?.value) {
          clearInterval(interval)
          resolve()
        }
      }, 1000)
    })

    return {
      hash: result
    }
  }

  public parseUnits(): bigint {
    return 0n
  }

  public formatUnits(): string {
    return ''
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === params.id)

    if (!connector) {
      throw new Error('Provider not found')
    }

    const rpcUrl =
      params.rpcUrl ||
      this.getCaipNetworks()?.find(n => n.id === params.chainId)?.rpcUrls.default.http[0]

    if (!rpcUrl) {
      throw new Error(`RPC URL not found for chainId: ${params.chainId}`)
    }

    const connection = this.connections.find(c => c.connectorId === connector.id)

    if (connection) {
      const [account] = connection.accounts

      if (account) {
        this.emit('accountChanged', {
          address: account.address,
          chainId: connection.caipNetwork?.id,
          connector
        })

        return {
          id: connector.id,
          address: account.address,
          chainId: params.chainId as string,
          provider: connector as CoreProvider,
          type: connector.type
        }
      }
    }

    const address = await connector.connect({
      chainId: params.chainId as string
    })

    if (connector.id !== CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
      this.listenProviderEvents(connector.id, connector.provider as SolanaProvider)
    }

    SolStoreUtil.setConnection(new Connection(rpcUrl, this.connectionSettings))

    this.emit('accountChanged', {
      address,
      chainId: params.chainId as string,
      connector
    })

    const isAuth = connector.id === CommonConstantsUtil.CONNECTOR_ID.AUTH
    const caipNetwork = this.getCaipNetworks()?.find(network => network.id === params.chainId)

    this.addConnection({
      connectorId: connector.id,
      accounts: [{ address }],
      caipNetwork,
      auth: isAuth
        ? {
            name: StorageUtil.getConnectedSocialProvider(),
            username: StorageUtil.getConnectedSocialUsername()
          }
        : undefined
    })

    return {
      id: connector.id,
      address,
      chainId: params.chainId as string,
      provider: connector as CoreProvider,
      type: connector.type
    }
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const address = params.address
    const caipNetwork = this.getCaipNetworks()?.find(network => network.id === params.chainId)

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'SOL' })
    }

    const connection = new Connection(
      caipNetwork?.rpcUrls?.default?.http?.[0] as string,
      this.connectionSettings
    )

    const caipAddress = `${caipNetwork?.caipNetworkId}:${params.address}`
    const cachedPromise = this.balancePromises[caipAddress]
    if (cachedPromise) {
      return cachedPromise
    }
    const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
    if (cachedBalance) {
      return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
    }
    this.balancePromises[caipAddress] = new Promise<AdapterBlueprint.GetBalanceResult>(
      async resolve => {
        try {
          const balance = await connection.getBalance(new PublicKey(address))
          const formattedBalance = (balance / SolConstantsUtil.LAMPORTS_PER_SOL).toString()

          StorageUtil.updateNativeBalanceCache({
            caipAddress,
            balance: formattedBalance,
            symbol: params.caipNetwork?.nativeCurrency.symbol || 'SOL',
            timestamp: Date.now()
          })

          if (!params.caipNetwork) {
            throw new Error('caipNetwork is required')
          }

          resolve({
            balance: formattedBalance,
            symbol: params.caipNetwork?.nativeCurrency.symbol
          })
        } catch (error) {
          resolve({ balance: '0.00', symbol: 'SOL' })
        }
      }
    ).finally(() => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.balancePromises[caipAddress]
    })

    return this.balancePromises[caipAddress] || { balance: '0.00', symbol: 'SOL' }
  }

  public override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    await super.switchNetwork(params)

    const { caipNetwork } = params

    if (caipNetwork?.rpcUrls?.default?.http?.[0]) {
      SolStoreUtil.setConnection(
        new Connection(caipNetwork.rpcUrls.default.http[0], this.connectionSettings)
      )
    }
  }

  private providerHandlers: Record<
    string,
    {
      disconnect: () => void
      accountsChanged: (publicKey: PublicKey) => void
      provider: SolanaProvider
    } | null
  > = {}

  private listenProviderEvents(connectorId: string, provider: SolanaProvider) {
    if (IGNORED_CONNECTIONS_IDS.includes(connectorId)) {
      return
    }

    // eslint-disable-next-line no-param-reassign
    connectorId = connectorId.toLowerCase()

    const disconnect = () => {
      this.removeProviderListeners(connectorId)
      this.deleteConnection(connectorId)

      if (this.connections.length === 0) {
        this.emit('disconnect')
      }
    }

    const accountsChangedHandler = (publicKey: PublicKey) => {
      const address = publicKey.toBase58()

      if (address) {
        const connection = this.connections.find(c =>
          HelpersUtil.isLowerCaseMatch(c.connectorId, connectorId)
        )

        if (connection) {
          const connector = this.connectors.find(c =>
            HelpersUtil.isLowerCaseMatch(c.id, connectorId)
          )

          if (!connector) {
            throw new Error('Connector not found')
          }

          if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('solana'), connectorId)) {
            this.emit('accountChanged', {
              address,
              chainId: connection.caipNetwork?.id,
              connector
            })
          }

          this.addConnection({
            connectorId,
            accounts: [{ address }],
            caipNetwork: connection?.caipNetwork
          })
        }
      }
    }

    if (!this.providerHandlers[connectorId]) {
      provider.on('disconnect', disconnect)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('connect', accountsChangedHandler)
      provider.on('pendingTransaction', () => {
        this.emit('pendingTransactions')
      })

      this.providerHandlers[connectorId] = {
        provider,
        disconnect,
        accountsChanged: accountsChangedHandler
      }
    }
  }

  private removeProviderListeners(connectorId: string) {
    if (this.providerHandlers[connectorId]) {
      const { provider, disconnect, accountsChanged } = this.providerHandlers[connectorId]

      provider.removeListener('disconnect', disconnect)
      provider.removeListener('accountsChanged', accountsChanged)
      provider.removeListener('connect', accountsChanged)
      provider.removeListener('pendingTransaction', () => {
        this.emit('pendingTransactions')
      })

      this.providerHandlers[connectorId] = null
    }
  }

  public override setUniversalProvider(universalProvider: UniversalProvider): void {
    this.universalProvider = universalProvider
    const wcConnectorId = CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    WcHelpersUtil.listenWcProvider({
      universalProvider,
      namespace: 'solana',
      onConnect: accounts => {
        if (accounts.length > 0) {
          const chainId = accounts[0]?.chainId as number | string
          const caipNetwork = this.getCaipNetworks()?.find(network => network.id === chainId)

          const connector = this.connectors.find(c => c.id === wcConnectorId)

          this.emit('accountChanged', {
            address: accounts[0]?.address as string,
            chainId,
            connector
          })

          this.addConnection({
            connectorId: wcConnectorId,
            accounts: accounts.map(account => ({ address: account.address })),
            caipNetwork
          })
        }
      },
      onDisconnect: () => {
        this.removeProviderListeners(wcConnectorId)
        this.deleteConnection(wcConnectorId)

        if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('solana'), wcConnectorId)) {
          this.chooseFirstConnectionAndEmit()
        }

        if (this.connections.length === 0) {
          this.emit('disconnect')
        }
      },
      onAccountsChanged: accounts => {
        if (accounts.length > 0) {
          const connector = this.connectors.find(c =>
            HelpersUtil.isLowerCaseMatch(c.id, wcConnectorId)
          )

          if (!connector) {
            throw new Error('Connector not found')
          }

          const chainId = accounts[0]?.chainId as number | string

          if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('solana'), wcConnectorId)) {
            this.emit('accountChanged', {
              address: accounts[0]?.address as string,
              chainId,
              connector
            })
          }
        }
      },
      onChainChanged: chainId => {
        if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('solana'), wcConnectorId)) {
          this.emit('switchNetwork', {
            chainId
          })
        }

        const connection = this.connections.find(c =>
          HelpersUtil.isLowerCaseMatch(c.connectorId, wcConnectorId)
        )

        if (connection) {
          const caipNetwork = this.getCaipNetworks()
            .filter(n => n.chainNamespace === 'solana')
            .find(n => n.id.toString() === chainId.toString())

          this.addConnection({
            connectorId: wcConnectorId,
            accounts: connection.accounts.map(account => ({ address: account.address })),
            caipNetwork
          })
        }
      }
    })

    this.addConnector(
      new SolanaWalletConnectProvider({
        provider: universalProvider,
        chains: this.getCaipNetworks(),
        getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
      })
    )
  }

  public override async connectWalletConnect(chainId?: string | number) {
    const result = await super.connectWalletConnect(chainId)

    const rpcUrl = this.getCaipNetworks()?.find(n => n.id === chainId)?.rpcUrls.default
      .http[0] as string
    const connection = new Connection(rpcUrl, this.connectionSettings)

    SolStoreUtil.setConnection(connection)

    return result
  }

  public async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    const connector = this.connectors.find(c => c.id === params.id)

    if (!connector) {
      throw new Error('Provider not found')
    }
    await connector.provider.disconnect()

    this.deleteConnection(connector.id)

    if (this.connections.length === 0) {
      this.emit('disconnect')
    } else {
      const [lastConnection] = this.connections.filter(c => c.accounts.length > 0)

      if (
        lastConnection &&
        HelpersUtil.isLowerCaseMatch(connector.id, this.getConnectorId('solana'))
      ) {
        const [account] = lastConnection.accounts

        const newConnector = this.connectors.find(c =>
          HelpersUtil.isLowerCaseMatch(c.id, lastConnection.connectorId)
        )

        if (account) {
          this.emit('accountChanged', {
            address: account.address,
            chainId: lastConnection.caipNetwork?.id,
            connector: newConnector
          })
        }
      }
    }
  }

  public async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    return this.connect({
      ...params,
      type: ''
    })
  }

  public async syncConnections({
    connectToFirstConnector,
    caipNetwork,
    getConnectorStorageInfo
  }: AdapterBlueprint.SyncConnectionsParams) {
    await Promise.allSettled(
      this.connectors
        .filter(c => {
          const { isDisconnected, hasConnected } = getConnectorStorageInfo(c.id)

          return !isDisconnected && hasConnected
        })
        .map(async connector => {
          if (connector.id === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
            const accounts = WcHelpersUtil.getWalletConnectAccounts(
              this.universalProvider as UniversalProvider,
              'solana'
            )

            if (accounts.length > 0) {
              this.addConnection({
                connectorId: connector.id,
                accounts: accounts.map(account => ({ address: account.address })),
                caipNetwork
              })
            }
          } else {
            const address = await connector.connect({
              chainId: caipNetwork?.id as string
            })
            SolStoreUtil.setConnection(
              new Connection(
                caipNetwork?.rpcUrls?.default?.http?.[0] as string,
                this.connectionSettings
              )
            )
            if (address) {
              this.addConnection({
                connectorId: connector.id,
                accounts: [{ address }],
                caipNetwork
              })
              this.listenProviderEvents(connector.id, connector.provider as SolanaProvider)
            }
          }
        })
    )

    if (connectToFirstConnector) {
      this.chooseFirstConnectionAndEmit()
    }
  }

  public getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult {
    const walletConnectProvider = new SolanaWalletConnectProvider({
      provider: params.provider as UniversalProvider,
      chains: params.caipNetworks,
      getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace)
    })

    return walletConnectProvider as unknown as UniversalProvider
  }

  private chooseFirstConnectionAndEmit() {
    const firstConnection = this.connections.find(c => {
      const hasAccounts = c.accounts.length > 0
      const hasConnector = this.connectors.some(connector =>
        HelpersUtil.isLowerCaseMatch(connector.id, c.connectorId)
      )

      return hasAccounts && hasConnector
    })

    if (firstConnection) {
      const [account] = firstConnection.accounts
      const connector = this.connectors.find(c =>
        HelpersUtil.isLowerCaseMatch(c.id, firstConnection.connectorId)
      )

      this.emit('accountChanged', {
        address: account?.address as string,
        chainId: firstConnection.caipNetwork?.id,
        connector
      })
    }
  }

  public async disconnectAll() {
    const connections = await Promise.all(
      this.connections.map(async connection => {
        const connector = this.connectors.find(c =>
          HelpersUtil.isLowerCaseMatch(c.id, connection.connectorId)
        )

        if (!connector) {
          throw new Error('Connector not found')
        }

        await this.disconnect({
          id: connector.id
        })

        return connection
      })
    )

    return { connections }
  }
}
