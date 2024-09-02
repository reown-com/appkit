import { Connection } from '@solana/web3.js'
import {
  ApiController,
  AssetController,
  ChainController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  OptionsController
} from '@web3modal/core'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

import { SolConstantsUtil } from './utils/SolanaConstantsUtil.js'
import { SolHelpersUtil } from './utils/SolanaHelpersUtils.js'
import { SolStoreUtil } from './utils/SolanaStoreUtil.js'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import UniversalProvider, { type UniversalProviderOpts } from '@walletconnect/universal-provider'
import type {
  ConnectionControllerClient,
  NetworkControllerClient,
  Connector
} from '@web3modal/core'
import type { AdapterType, CaipAddress, CaipNetwork, CaipNetworkId } from '@web3modal/common'
import type { ChainNamespace } from '@web3modal/common'

import type { Provider } from './utils/SolanaTypesUtil.js'
import { watchStandard } from './utils/watchStandard.js'
import { WalletConnectProvider } from './providers/WalletConnectProvider.js'
import { AuthProvider } from './providers/AuthProvider.js'
import {
  W3mFrameHelpers,
  W3mFrameProvider,
  W3mFrameRpcConstants,
  type W3mFrameTypes
} from '@web3modal/wallet'
import { withSolanaNamespace } from './utils/withSolanaNamespace.js'
import type { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { ProviderUtil } from '@web3modal/base/store'
import { SafeLocalStorage } from '@web3modal/base/utils'

export interface AdapterOptions {
  connectionSettings?: Commitment | ConnectionConfig
  defaultCaipNetwork?: CaipNetwork
  wallets?: BaseWalletAdapter[]
}

export type Web3ModalOptions = Omit<AdapterOptions, '_sdkVersion' | 'isUniversalProvider'>

// -- Client --------------------------------------------------------------------
export class SolanaWeb3JsClient {
  private appKit: AppKit | undefined = undefined

  public options: AppKitOptions | undefined = undefined

  public wallets?: BaseWalletAdapter[]

  private hasSyncedConnectedAccount = false

  private caipNetworks: CaipNetwork[] = []

  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.SOLANA

  public networkControllerClient?: NetworkControllerClient

  public connectionControllerClient?: ConnectionControllerClient

  public connectionSettings: Commitment | ConnectionConfig

  private availableProviders: Provider[] = []

  private provider: Provider | undefined

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  public adapterType: AdapterType = 'solana'

  public constructor(options: AdapterOptions) {
    const { wallets, connectionSettings = 'confirmed' } = options

    this.wallets = wallets

    this.connectionSettings = connectionSettings
  }

  public construct(appKit: AppKit, options: AppKitOptions) {
    const { projectId, caipNetworks } = options

    if (!options) {
      throw new Error('Solana:construct - options is undefined')
    }

    this.appKit = appKit

    this.options = options
    this.caipNetworks = caipNetworks

    if (!projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (caipNetwork) {
          SafeLocalStorage.setItem('@w3m/active_caipnetwork', JSON.stringify(caipNetwork))
          try {
            await this.switchNetwork(caipNetwork)
          } catch (error) {
            // SolStoreUtil.setError(error)
          }
        }
      },

      getApprovedCaipNetworksData: async () => {
        let provider = ProviderUtil.state.providers['solana'] as Provider

        const isUniversalProvider = provider instanceof UniversalProvider
        if (isUniversalProvider) {
          provider = this.getSolanaWalletConnectProvider(provider as unknown as UniversalProvider)
        }

        if (provider) {
          const approvedCaipNetworkIds = provider.chains.map<CaipNetworkId>(
            chain => `solana:${chain.chainId}`
          )

          return Promise.resolve({
            approvedCaipNetworkIds,
            supportsAllNetworks: false
          })
        }

        return Promise.resolve({
          approvedCaipNetworkIds: undefined,
          supportsAllNetworks: false
        })
      }
    }

    this.connectionControllerClient = {
      connectExternal: async ({ id }) => {
        const externalProvider = this.availableProviders.find(
          provider => provider.name.toLocaleLowerCase() === id.toLocaleLowerCase()
        )

        if (!externalProvider) {
          throw Error('connectionControllerClient:connectExternal - adapter was undefined')
        }

        return this.setProvider(externalProvider)
      },

      disconnect: async () => {
        await ProviderUtil.getProvider<Provider>('solana')?.disconnect()

        this.appKit?.resetAccount('solana')
      },

      signMessage: async (message: string) => {
        const provider = ProviderUtil.state.providers['solana'] as Provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.signMessage(new TextEncoder().encode(message))

        return new TextDecoder().decode(signature)
      },

      estimateGas: async () => await Promise.resolve(BigInt(0)),
      // -- Transaction methods ---------------------------------------------------
      /**
       *
       * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
       * These function definition is to have a type parity between the clients. Currently not in use.
       */
      getEnsAvatar: async (value: string) => await Promise.resolve(value),

      getEnsAddress: async (value: string) => await Promise.resolve(value),

      writeContract: async () => await Promise.resolve('0x'),

      sendTransaction: async () => await Promise.resolve('0x'),

      parseUnits: () => BigInt(0),

      formatUnits: () => ''
    }

    ChainController.state.chains.set(this.chainNamespace, {
      chainNamespace: this.chainNamespace,
      connectionControllerClient: this.connectionControllerClient,
      networkControllerClient: this.networkControllerClient,
      adapterType: this.adapterType
    })

    ProviderUtil.subscribeProviders(providers => {
      if (providers['solana'] && providers['solana'] instanceof UniversalProvider) {
        const walletConnectProvider = this.getSolanaWalletConnectProvider(providers['solana'])
        ProviderUtil.setProvider('solana', walletConnectProvider)
      }
    })

    this.initializeProviders({
      relayUrl: SolConstantsUtil.UNIVERSAL_PROVIDER_RELAY_URL,
      metadata: options.metadata,
      projectId: options.projectId,
      ...options.features
    })

    this.syncRequestedNetworks(caipNetworks)

    const caipNetwork = SolHelpersUtil.getChainFromCaip(
      caipNetworks,
      typeof window === 'object' ? SafeLocalStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )

    this.defaultCaipNetwork = caipNetwork
    this.syncRequestedNetworks(caipNetworks)

    this.syncNetwork()

    AssetController.subscribeNetworkImages(() => {
      this.syncNetwork()
    })

    NetworkController.subscribeKey('caipNetwork', (newCaipNetwork: CaipNetwork | undefined) => {
      const newChain = caipNetworks.find(
        _chain => _chain.chainId === newCaipNetwork?.id.split(':')[1]
      )

      if (!newChain) {
        return
      }

      if (NetworkController.state.caipNetwork && this.appKit?.getIsConnectedState()) {
        SafeLocalStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `solana:${newChain.chainId}`)
        ApiController.reFetchWallets()
      }
    })

    EventsController.subscribe(state => {
      if (state.data.event === 'SELECT_WALLET' && state.data.properties?.name === 'Phantom') {
        const isMobile = CoreHelperUtil.isMobile()
        const isClient = CoreHelperUtil.isClient()
        if (isMobile && isClient && !('phantom' in window)) {
          const href = window.location.href
          const protocol = href.startsWith('https') ? 'https' : 'http'
          const host = href.split('/')[2]
          const ref = `${protocol}://${host}`
          window.location.href = `https://phantom.app/ul/browse/${href}?ref=${ref}`
        }
      }
    })
  }

  public getWalletConnection() {
    return SolStoreUtil.state.connection
  }

  // -- Private -----------------------------------------------------------------
  private syncConnectedWalletInfo() {
    const currentActiveWallet = SafeLocalStorage.getItem(SolConstantsUtil.WALLET_ID)
    const provider = ProviderUtil.getProvider<Provider>('solana')

    if (provider?.type === 'WALLET_CONNECT') {
      const wcProvider = provider as WalletConnectProvider
      if (wcProvider.session) {
        this.appKit?.setConnectedWalletInfo(
          {
            ...wcProvider.session.peer.metadata,
            name: wcProvider.session.peer.metadata.name,
            icon: wcProvider.session.peer.metadata.icons?.[0]
          },
          this.chainNamespace
        )
      }
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, this.chainNamespace)
    }
  }

  private async syncAccount() {
    const address = this.appKit?.getAddress()
    const chainId = this.appKit?.getCaipNetwork()?.chainId
    const isConnected = this.appKit?.getIsConnectedState()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `solana:${chainId}:${address}`
      this.appKit?.setIsConnected(isConnected, this.chainNamespace)
      this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
      await this.syncBalance(address)
      this.syncConnectedWalletInfo()

      this.hasSyncedConnectedAccount = true
    } else if (this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
      this.appKit?.resetAccount('solana')
    }
  }

  private async syncBalance(address: string) {
    if (!SolStoreUtil.state.connection) {
      throw new Error('Connection is not set')
    }

    if (!this.appKit?.getCaipNetwork()) {
      throw new Error('CaipNetwork is not set')
    }

    const balance =
      (await SolStoreUtil.state.connection.getBalance(new PublicKey(address))) /
      SolConstantsUtil.LAMPORTS_PER_SOL

    this.appKit?.setBalance(
      balance.toString(),
      this.appKit?.getCaipNetwork()?.currency,
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

  public async switchNetwork(caipNetwork: CaipNetwork) {
    if (this.provider instanceof AuthProvider) {
      await this.provider.switchNetwork(caipNetwork.chainId)
    }

    this.appKit?.setCaipNetwork(caipNetwork)

    SafeLocalStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, caipNetwork.id)

    await this.syncNetwork()
    await this.syncAccount()
  }

  private async syncNetwork() {
    const address = this.appKit?.getAddress()
    const caipNetwork = this.appKit?.getCaipNetwork()

    if (caipNetwork) {
      SolStoreUtil.setConnection(
        new Connection(
          SolHelpersUtil.detectRpcUrl(caipNetwork, OptionsController.state.projectId),
          this.connectionSettings
        )
      )

      this.appKit?.setCaipNetwork(caipNetwork)
      if (address) {
        if (caipNetwork.explorerUrl) {
          const url = `${caipNetwork.explorerUrl}/account/${address}`
          this.appKit?.setAddressExplorerUrl(url, this.chainNamespace)
        } else {
          this.appKit?.setAddressExplorerUrl(undefined, this.chainNamespace)
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncBalance(address)
        }
      }
    }
  }

  private async setProvider(provider: Provider) {
    try {
      this.appKit?.setLoading(true)
      const address = await provider.connect()
      const caipChainId = SafeLocalStorage.getItem('@w3m/solana_caip_chain')
      let connectionChain: CaipNetwork | undefined = undefined

      const activeCaipNetwork = this.appKit?.getCaipNetwork()

      // eslint-disable-next-line no-nested-ternary
      connectionChain = caipChainId
        ? SolHelpersUtil.getChainFromCaip(this.caipNetworks, caipChainId)
        : activeCaipNetwork?.chainNamespace === 'eip155'
          ? this.caipNetworks.find(chain => chain.chainNamespace === 'solana')
          : activeCaipNetwork || this.caipNetworks.find(chain => chain.chainNamespace === 'solana')

      if (connectionChain) {
        this.appKit?.setCaipAddress(
          `solana:${connectionChain.chainId}:${address}`,
          this.chainNamespace
        )

        await this.switchNetwork(connectionChain)

        ProviderUtil.setProvider('solana', provider)
        ProviderUtil.setProviderId('solana', 'walletConnect')
        this.provider = provider

        SafeLocalStorage.setItem(SolConstantsUtil.WALLET_ID, provider.name)

        await this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)

        this.watchProvider(provider)
        this.appKit?.setIsConnected(true, this.chainNamespace)
      }
    } finally {
      this.appKit?.setLoading(false)
    }
  }

  private watchProvider(provider: Provider) {
    /*
     * The auth RPC request handlers should be moved to the primary scaffold (Web3ModalScaffold).
     * They are replicated in wagmi and ethers clients and the behavior should be kept the same
     * between any client.
     */

    // eslint-disable-next-line func-style
    const rpcRequestHandler = (request: W3mFrameTypes.RPCRequest) => {
      if (!this.appKit) {
        return
      }

      if (W3mFrameHelpers.checkIfRequestExists(request)) {
        if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
          if (this.appKit.isOpen()) {
            if (this.appKit.isTransactionStackEmpty()) {
              return
            }
            if (this.appKit.isTransactionShouldReplaceView()) {
              this.appKit.replace('ApproveTransaction')
            } else {
              this.appKit.redirect('ApproveTransaction')
            }
          } else {
            this.appKit.open({ view: 'ApproveTransaction' })
          }
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
      SafeLocalStorage.removeItem(SolConstantsUtil.WALLET_ID)

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('connect', accountsChangedHandler)
      provider.removeListener('auth_rpcRequest', rpcRequestHandler)
      provider.removeListener('auth_rpcSuccess', rpcSuccessHandler)
      provider.removeListener('auth_rpcError', rpcErrorHandler)
    }

    function accountsChangedHandler(publicKey: PublicKey, appKit?: AppKit) {
      const currentAccount: string = publicKey.toBase58()
      const caipNetwork = appKit?.getCaipNetwork()
      if (currentAccount && caipNetwork) {
        appKit?.setCaipAddress(`solana:${caipNetwork.chainId}:${currentAccount}`, 'solana')
      } else {
        SafeLocalStorage.removeItem(SolConstantsUtil.WALLET_ID)
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

    return walletConnectProvider
  }

  private initializeProviders(opts: UniversalProviderOpts) {
    if (CoreHelperUtil.isClient()) {
      if (!opts.projectId) {
        throw new Error('projectId is required for AuthProvider')
      }

      this.addProvider(
        new AuthProvider({
          provider: new W3mFrameProvider(
            opts.projectId,
            withSolanaNamespace(this.appKit?.getCaipNetwork()?.chainId)
          ),
          getActiveChain: () => this.appKit?.getCaipNetwork(),
          chains: this.caipNetworks
        })
      )

      if (this.appKit && this.caipNetworks[0]) {
        watchStandard(this.appKit, this.caipNetworks[0], standardAdapters =>
          this.addProvider.bind(this)(...standardAdapters)
        )
      }
    }
  }

  private addProvider(...providers: Provider[]) {
    const activeProviderName = SafeLocalStorage.getItem(SolConstantsUtil.WALLET_ID)

    for (const provider of providers) {
      this.availableProviders = this.availableProviders.filter(p => p.name !== provider.name)
      if (provider.type !== 'WALLET_CONNECT') {
        this.availableProviders.push(provider)
      }

      if (provider.name === activeProviderName) {
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
      provider,
      chain: CommonConstantsUtil.CHAIN.SOLANA
    }))

    this.appKit?.setConnectors(connectors)
  }
}
