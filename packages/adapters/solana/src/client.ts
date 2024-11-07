import { Connection } from '@solana/web3.js'
import {
  AccountController,
  ApiController,
  ChainController,
  CoreHelperUtil,
  EventsController,
  AlertController
} from '@reown/appkit-core'
import {
  ConstantsUtil as CommonConstantsUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys
} from '@reown/appkit-common'

import { SolConstantsUtil } from '@reown/appkit-utils/solana'
import { SolStoreUtil } from './utils/SolanaStoreUtil.js'
import type { Provider } from '@reown/appkit-utils/solana'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import UniversalProvider, { type UniversalProviderOpts } from '@walletconnect/universal-provider'
import type {
  ChainAdapter,
  ConnectionControllerClient,
  NetworkControllerClient,
  Connector
} from '@reown/appkit-core'
import type { AdapterType, CaipAddress, CaipNetwork } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'

import { watchStandard } from './utils/watchStandard.js'
import { WalletConnectProvider } from './providers/WalletConnectProvider.js'
import { AuthProvider } from './providers/AuthProvider.js'
import {
  W3mFrameHelpers,
  W3mFrameProvider,
  W3mFrameRpcConstants,
  type W3mFrameTypes
} from '@reown/appkit-wallet'
import { ConstantsUtil as CoreConstantsUtil } from '@reown/appkit-core'
import { withSolanaNamespace } from './utils/withSolanaNamespace.js'
import type { AppKit, AppKitOptionsWithCaipNetworks } from '@reown/appkit'
import type { AppKitOptions as CoreOptions } from '@reown/appkit'
import { ProviderUtil } from '@reown/appkit/store'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'
import { ConstantsUtil, ErrorUtil } from '@reown/appkit-utils'
import { createSendTransaction } from './utils/createSendTransaction.js'
import { CoinbaseWalletProvider } from './providers/CoinbaseWalletProvider.js'
import base58 from 'bs58'

export interface AdapterOptions {
  connectionSettings?: Commitment | ConnectionConfig
  wallets?: BaseWalletAdapter[]
}

export type AppKitOptions = Omit<AdapterOptions, '_sdkVersion' | 'isUniversalProvider'>

// -- Client --------------------------------------------------------------------
export class SolanaAdapter implements ChainAdapter {
  private appKit: AppKit | undefined = undefined

  private authProvider?: Provider

  private w3mFrameProvider?: W3mFrameProvider

  public options: CoreOptions | undefined = undefined

  public wallets?: BaseWalletAdapter[]

  public caipNetworks: CaipNetwork[] = []

  public readonly chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.SOLANA

  public networkControllerClient?: NetworkControllerClient

  public connectionControllerClient?: ConnectionControllerClient

  public connectionSettings: Commitment | ConnectionConfig

  private availableProviders: Provider[] = []

  private provider: Provider | undefined

  private authSession: AuthProvider.Session | undefined

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  public readonly adapterType: AdapterType = 'solana'

  public constructor(options: AdapterOptions) {
    const { wallets, connectionSettings = 'confirmed' } = options

    this.wallets = wallets
    this.connectionSettings = connectionSettings

    ChainController.subscribeKey('activeCaipNetwork', caipNetwork => {
      const caipAddress = this.appKit?.getCaipAddress(this.chainNamespace)
      const isSolanaAddress = caipAddress?.startsWith('solana:')
      const isSolanaNetwork = caipNetwork?.chainNamespace === this.chainNamespace

      if (caipAddress && isSolanaAddress && isSolanaNetwork) {
        this.syncAccount({
          address: CoreHelperUtil.getPlainAddress(caipAddress),
          caipNetwork
        })
      }
    })

    AccountController.subscribeKey(
      'caipAddress',
      caipAddress => {
        const isSolanaAddress = caipAddress?.startsWith('solana:')
        const caipNetwork = ChainController.state.activeCaipNetwork
        const isSolanaNetwork = caipNetwork?.chainNamespace === this.chainNamespace

        if (caipAddress && isSolanaAddress && isSolanaNetwork) {
          this.syncAccount({
            address: CoreHelperUtil.getPlainAddress(caipAddress),
            caipNetwork
          })
        }
      },
      this.chainNamespace
    )
  }

  public construct(appKit: AppKit, options: AppKitOptionsWithCaipNetworks) {
    const { projectId } = options

    this.appKit = appKit
    this.options = options
    this.caipNetworks = options.networks
    this.defaultCaipNetwork = options.defaultNetwork

    if (!projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (caipNetwork) {
          try {
            await this.switchNetwork(caipNetwork)
          } catch (error) {
            console.warn('Error switching network', error)
          }
        }
      },

      getApprovedCaipNetworksData: async () => {
        if (this.provider) {
          return Promise.resolve({
            supportsAllNetworks: false,
            approvedCaipNetworkIds: this.provider.chains.map(chain => chain.caipNetworkId)
          })
        }

        return Promise.resolve({
          supportsAllNetworks: false,
          approvedCaipNetworkIds: []
        })
      }
    }

    this.connectionControllerClient = {
      // eslint-disable-next-line @typescript-eslint/require-await
      connectExternal: async ({ id }) => {
        const externalProvider = this.availableProviders.find(
          provider => provider.name.toLocaleLowerCase() === id.toLocaleLowerCase()
        )
        const isAuthProvider =
          id.toLocaleLowerCase() === ConstantsUtil.AUTH_CONNECTOR_ID.toLocaleLowerCase()

        if (!externalProvider) {
          throw Error('connectionControllerClient:connectExternal - adapter was undefined')
        }

        const chainNamespace = this.appKit?.getActiveChainNamespace()

        // If it's not the auth provider, we should auto connect the provider
        if (chainNamespace === this.chainNamespace || !isAuthProvider) {
          await this.setProvider(externalProvider)
        }
      },

      disconnect: async () => {
        await ProviderUtil.getProvider<Provider>('solana')?.disconnect()

        this.appKit?.resetAccount(this.chainNamespace)
      },

      signMessage: async (message: string) => {
        const provider = ProviderUtil.state.providers['solana'] as Provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.signMessage(new TextEncoder().encode(message))

        return base58.encode(signature)
      },

      estimateGas: async params => {
        if (params.chainNamespace !== CommonConstantsUtil.CHAIN.SOLANA) {
          throw new Error('Chain namespace is not supported')
        }

        const connection = SolStoreUtil.state.connection

        if (!connection || !this.provider) {
          throw new Error('Connection is not set')
        }

        const transaction = await createSendTransaction({
          provider: this.provider,
          connection,
          to: '11111111111111111111111111111111',
          value: 1
        })

        const fee = await transaction.getEstimatedFee(connection)

        return BigInt(fee || 0)
      },
      // -- Transaction methods ---------------------------------------------------
      /**
       *
       * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
       * These function definition is to have a type parity between the clients. Currently not in use.
       */
      getEnsAvatar: async (value: string) => await Promise.resolve(value),

      getEnsAddress: async (value: string) => await Promise.resolve(value),

      writeContract: async () => await Promise.resolve('0x'),

      getCapabilities: async () => await Promise.resolve('0x'),

      grantPermissions: async () => await Promise.resolve('0x'),

      revokePermissions: async () => await Promise.resolve('0x'),

      sendTransaction: async params => {
        if (params.chainNamespace !== CommonConstantsUtil.CHAIN.SOLANA) {
          throw new Error('Chain namespace is not supported')
        }

        const connection = SolStoreUtil.state.connection
        const address = this.appKit?.getAddress(this.chainNamespace)

        if (!connection || !address || !this.provider) {
          throw new Error('Connection is not set')
        }

        const transaction = await createSendTransaction({
          provider: this.provider,
          connection,
          to: params.to,
          value: params.value
        })

        const result = await this.provider.sendTransaction(transaction, connection)

        await new Promise<void>(resolve => {
          const interval = setInterval(async () => {
            const status = await connection.getSignatureStatus(result)

            if (status?.value) {
              clearInterval(interval)
              resolve()
            }
          }, 1000)
        })

        await this.syncBalance(address)

        return result
      },

      parseUnits: () => BigInt(0),

      formatUnits: () => '',

      checkInstalled: (ids: string[] = []) => {
        const availableIds = new Set(this.availableProviders.map(provider => provider.name))

        return ids.some(id => availableIds.has(id))
      }
    }

    ChainController.state.chains.set(this.chainNamespace, {
      chainNamespace: this.chainNamespace,
      connectionControllerClient: this.connectionControllerClient,
      networkControllerClient: this.networkControllerClient,
      adapterType: this.adapterType,
      caipNetworks: this.caipNetworks
    })

    ProviderUtil.subscribeProviders(providers => {
      if (providers['solana'] && providers['solana'] instanceof UniversalProvider) {
        const walletConnectProvider = this.getSolanaWalletConnectProvider(providers['solana'])
        ProviderUtil.setProvider(this.chainNamespace, walletConnectProvider)
      }
    })

    this.syncRequestedNetworks(this.caipNetworks)

    this.initializeProviders({
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: options.metadata,
      projectId: options.projectId
    })

    this.syncRequestedNetworks(this.caipNetworks)

    ChainController.subscribeKey('activeCaipNetwork', (newCaipNetwork: CaipNetwork | undefined) => {
      const newChain = this.caipNetworks.find(_chain => _chain.id === newCaipNetwork?.id)

      if (!newChain) {
        return
      }

      if (ChainController.state.activeCaipNetwork && this.appKit?.getIsConnectedState()) {
        ApiController.reFetchWallets()
      }
    })

    EventsController.subscribe(state => {
      if (state.data.event === 'SELECT_WALLET') {
        const isMobile = CoreHelperUtil.isMobile()
        const isClient = CoreHelperUtil.isClient()

        if (isMobile && isClient) {
          if (state.data.properties?.name === 'Phantom' && !('phantom' in window)) {
            const href = window.location.href
            const protocol = href.startsWith('https') ? 'https' : 'http'
            const host = href.split('/')[2]
            const ref = `${protocol}://${host}`
            window.location.href = `https://phantom.app/ul/browse/${href}?ref=${ref}`
          }

          if (state.data.properties?.name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
            const href = window.location.href
            window.location.href = `https://go.cb-w.com/dapp?cb_url=${href}`
          }
        }
      }
    })
  }

  public getWalletConnection() {
    return SolStoreUtil.state.connection
  }

  // -- Private -----------------------------------------------------------------
  private async syncAccount({
    address,
    caipNetwork
  }: {
    address: string | undefined
    caipNetwork: CaipNetwork | undefined
  }) {
    if (address && caipNetwork) {
      SolStoreUtil.setConnection(
        new Connection(caipNetwork.rpcUrls.default.http?.[0] as string, this.connectionSettings)
      )
      this.appKit?.setAllAccounts([{ address, type: 'eoa' }], this.chainNamespace)
      this.appKit?.setCaipAddress(
        `${this.chainNamespace}:${caipNetwork.id}:${address}`,
        this.chainNamespace
      )
      await this.syncNetwork(address)
    } else {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork(this.chainNamespace)
      this.appKit?.resetAccount(this.chainNamespace)
    }
  }

  private async syncBalance(address = this.appKit?.getAddress(this.chainNamespace)) {
    if (!address) {
      return
    }

    if (!SolStoreUtil.state.connection) {
      throw new Error('Connection is not set')
    }

    if (!this.appKit?.getCaipNetwork()) {
      this.appKit?.setCaipNetwork(this.defaultCaipNetwork)
    }

    const balance =
      (await SolStoreUtil.state.connection.getBalance(new PublicKey(address))) /
      SolConstantsUtil.LAMPORTS_PER_SOL

    this.appKit?.setBalance(
      balance.toString(),
      this.appKit?.getCaipNetwork()?.nativeCurrency.symbol,
      this.chainNamespace
    )
  }

  private syncRequestedNetworks(caipNetworks: CaipNetwork[]) {
    const uniqueChainNamespaces = Array.from(
      new Set(caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))
    )
    uniqueChainNamespaces.forEach(chainNamespace => {
      this.appKit?.setRequestedCaipNetworks(
        caipNetworks.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace),
        chainNamespace
      )
    })
  }

  private getAuthSession() {
    return this.authSession
  }

  public async switchNetwork(caipNetwork: CaipNetwork) {
    const connectedConnector = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR)
    const isConnectedWithAuth = connectedConnector === 'AUTH'

    if (isConnectedWithAuth) {
      // If user is connected with auth provider, we need to switch the network on the auth provider and await the get user
      await this.w3mFrameProvider?.switchNetwork(caipNetwork.caipNetworkId)
      const user = await this.w3mFrameProvider?.getUser({
        chainId: caipNetwork?.caipNetworkId
      })
      this.authSession = user
      if (user) {
        const caipAddress = `${caipNetwork.caipNetworkId}:${user.address}`
        ProviderUtil.setProvider(this.chainNamespace, this.authProvider)
        ProviderUtil.setProviderId(this.chainNamespace, 'walletConnect')
        this.appKit?.setCaipAddress(caipAddress as CaipAddress, this.chainNamespace)
        this.syncAccount({
          address: user.address,
          caipNetwork
        })
      }
    } else {
      this.appKit?.setCaipNetwork(caipNetwork)

      const address = this.appKit?.getAddress(this.chainNamespace) as string
      await this.syncAccount({
        address,
        caipNetwork
      })
    }
  }

  private async syncNetwork(address: string | undefined) {
    const caipNetwork = this.appKit?.getCaipNetwork(this.chainNamespace)
    const connection = SolStoreUtil.state.connection

    if (!address || !caipNetwork || !connection) {
      return
    }

    this.appKit?.setAddressExplorerUrl(
      caipNetwork.blockExplorers?.default.url
        ? `${caipNetwork.blockExplorers.default.url}/account/${address}`
        : undefined,
      this.chainNamespace
    )
    await this.syncBalance(address)
  }

  private async setProvider(provider: Provider) {
    try {
      this.appKit?.setLoading(true)
      const address = await provider.connect()
      const caipNetworkId = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)

      const connectionChain =
        provider.chains.find(chain => chain.caipNetworkId === caipNetworkId) || provider.chains[0]

      if (connectionChain) {
        const caipAddress = `${connectionChain.caipNetworkId}:${address}` as const
        this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)

        await this.switchNetwork(connectionChain)

        ProviderUtil.setProvider(this.chainNamespace, provider)
        this.provider = provider

        switch (provider.type) {
          case 'WALLET_CONNECT':
            ProviderUtil.setProviderId(this.chainNamespace, 'walletConnect')
            break
          case 'AUTH':
            ProviderUtil.setProviderId(this.chainNamespace, 'w3mAuth')
            break
          default:
            ProviderUtil.setProviderId(this.chainNamespace, 'injected')
        }

        SafeLocalStorage.setItem(SafeLocalStorageKeys.WALLET_ID, provider.name)

        await this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)

        this.watchProvider(provider)
      }
    } finally {
      this.appKit?.setLoading(false)
    }
  }

  private watchProvider(provider: Provider) {
    /*
     * The auth RPC request handlers should be moved to the primary scaffold (appkit).
     * They are replicated in wagmi and ethers clients and the behavior should be kept the same
     * between any client.
     */

    // eslint-disable-next-line func-style
    const rpcRequestHandler = (request: W3mFrameTypes.RPCRequest) => {
      if (!this.appKit) {
        return
      }

      if (W3mFrameHelpers.checkIfRequestExists(request)) {
        if (!W3mFrameHelpers.checkIfRequestIsSafe(request)) {
          this.appKit?.handleUnsafeRPCRequest()
        }
      } else {
        this.appKit.open()
        // eslint-disable-next-line no-console
        console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
          method: request.method
        })
        setTimeout(() => {
          this.appKit?.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
        }, 300)
      }
    }

    // eslint-disable-next-line func-style
    const rpcSuccessHandler = (_response: W3mFrameTypes.FrameEvent) => {
      if (!this.appKit) {
        return
      }

      if (this.appKit.isTransactionStackEmpty()) {
        this.appKit.close()
      } else {
        this.appKit.popTransactionStack()
      }
    }

    // eslint-disable-next-line func-style
    const rpcErrorHandler = (_error: Error) => {
      if (!this.appKit) {
        return
      }

      if (this.appKit.isOpen()) {
        if (this.appKit.isTransactionStackEmpty()) {
          this.appKit.close()
        } else {
          this.appKit.popTransactionStack(true)
        }
      }
    }

    function disconnectHandler(appKit?: AppKit) {
      appKit?.resetAccount('solana')
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_ID)

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('connect', accountsChangedHandler)
      provider.removeListener('auth_rpcRequest', rpcRequestHandler)
      provider.removeListener('auth_rpcSuccess', rpcSuccessHandler)
      provider.removeListener('auth_rpcError', rpcErrorHandler)
    }

    function accountsChangedHandler(publicKey: PublicKey, appKit?: AppKit) {
      const currentAccount: string = publicKey.toBase58()
      const caipNetworkId = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
      const chainId = caipNetworkId?.split(':')[1]
      if (currentAccount && chainId) {
        appKit?.setCaipAddress(`solana:${chainId}:${currentAccount}`, 'solana')
      } else {
        SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_ID)
        appKit?.resetAccount('solana')
      }
    }

    provider.on('disconnect', () => disconnectHandler(this.appKit))
    provider.on('accountsChanged', (publicKey: PublicKey) =>
      accountsChangedHandler(publicKey, this.appKit)
    )
    provider.on('connect', accountsChangedHandler)
    provider.on('auth_rpcRequest', rpcRequestHandler)
    provider.on('auth_rpcSuccess', rpcSuccessHandler)
    provider.on('auth_rpcError', rpcErrorHandler)
  }

  private getSolanaWalletConnectProvider(provider: UniversalProvider) {
    const walletConnectProvider = new WalletConnectProvider({
      provider,
      chains: this.caipNetworks,
      getActiveChain: () => this.appKit?.getCaipNetwork()
    })

    this.addProvider(walletConnectProvider)

    return walletConnectProvider
  }

  private initializeProviders(opts: UniversalProviderOpts) {
    if (CoreHelperUtil.isClient()) {
      if (!opts.projectId) {
        throw new Error('projectId is required for AuthProvider')
      }

      const getActiveChain = () => this.appKit?.getCaipNetwork(this.chainNamespace)

      const emailEnabled =
        this.options?.features?.email === undefined
          ? CoreConstantsUtil.DEFAULT_FEATURES.email
          : this.options?.features?.email
      const socialsEnabled = this.options?.features?.socials
        ? this.options?.features?.socials?.length > 0
        : CoreConstantsUtil.DEFAULT_FEATURES.socials

      if (emailEnabled || socialsEnabled) {
        this.w3mFrameProvider = W3mFrameProviderSingleton.getInstance({
          projectId: opts.projectId,
          chainId: withSolanaNamespace(this.appKit?.getCaipNetwork(this.chainNamespace)?.id),
          onTimeout: () => {
            AlertController.open(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT, 'error')
          }
        })

        this.authProvider = new AuthProvider({
          getProvider: () => this.w3mFrameProvider as W3mFrameProvider,
          getActiveChain,
          getActiveNamespace: () => this.appKit?.getActiveChainNamespace(),
          getSession: () => this.getAuthSession(),
          setSession: (session: AuthProvider.Session | undefined) => {
            this.authSession = session
          },
          chains: this.caipNetworks
        })
        this.addProvider(this.authProvider)
      }

      if ('coinbaseSolana' in window) {
        this.addProvider(
          new CoinbaseWalletProvider({
            // @ts-expect-error - window is not typed
            provider: window.coinbaseSolana,
            chains: this.caipNetworks,
            getActiveChain
          })
        )
      }

      watchStandard(this.caipNetworks, getActiveChain, this.addProvider.bind(this))
    }
  }

  private addProvider(...providers: Provider[]) {
    const activeProviderName = SafeLocalStorage.getItem(SafeLocalStorageKeys.WALLET_ID)
    const activeNamespace = this.appKit?.getActiveChainNamespace()
    const isSolana = activeNamespace === this.chainNamespace

    for (const provider of providers) {
      this.availableProviders = this.availableProviders.filter(p => p.name !== provider.name)
      this.availableProviders.push(provider)

      if (provider.name === activeProviderName && isSolana) {
        this.setProvider(provider)
      }
    }

    this.syncConnectors()
  }

  private syncConnectors() {
    const connectors = this.availableProviders.map<Connector>(provider => ({
      id: provider.name,
      type: provider.type,
      imageUrl: provider.icon,
      name: provider.name,
      /**
       * When the provider is different from 'AUTH', we don't need to pass it to the connector.
       * This avoids issues with the valtio proxy and non-serializable state and follows same logic from other clients.
       */
      provider: provider.type === 'AUTH' ? provider : undefined,
      chain: CommonConstantsUtil.CHAIN.SOLANA
    }))

    this.appKit?.setConnectors(connectors)
  }
}
