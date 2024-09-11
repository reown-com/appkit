import { Connection } from '@solana/web3.js'
import {
  ApiController,
  AssetController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  OptionsController
} from '@web3modal/core'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

import { SolConstantsUtil, SolHelpersUtil, SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import UniversalProvider, { type UniversalProviderOpts } from '@walletconnect/universal-provider'
import type {
  CaipNetworkId,
  ConnectionControllerClient,
  NetworkControllerClient,
  Token,
  Connector,
  CaipAddress,
  CaipNetwork,
  ChainAdapter
} from '@web3modal/core'
import type { Chain as AvailableChain } from '@web3modal/common'

import type {
  ProviderType,
  Chain,
  Provider,
  SolStoreUtilState
} from '@web3modal/scaffold-utils/solana'
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
import type { AppKit } from '../../../src/client.js'
import type { AppKitOptions } from '../../../utils/TypesUtil.js'
import type { OptionsControllerState } from '@web3modal/core'
import { SafeLocalStorage } from '../../../utils/SafeLocalStorage.js'
import { createSendTransaction } from './utils/createSendTransaction.js'

export interface Web3ModalClientOptions
  extends Omit<AppKitOptions, 'defaultChain' | 'tokens' | 'sdkType' | 'sdkVersion'> {
  solanaConfig: ProviderType
  chains: Chain[]
  connectionSettings?: Commitment | ConnectionConfig
  defaultChain?: Chain
  chainImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
  wallets?: BaseWalletAdapter[]
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion' | 'isUniversalProvider'>

// -- Client --------------------------------------------------------------------
export class SolanaWeb3JsClient implements ChainAdapter<SolStoreUtilState, CaipNetwork> {
  private appKit: AppKit | undefined = undefined

  private instanceOptions: Web3ModalClientOptions | undefined = undefined

  public options: AppKitOptions | undefined = undefined

  private hasSyncedConnectedAccount = false

  private chains: Chain[]

  public chain: AvailableChain = CommonConstantsUtil.CHAIN.SOLANA

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public connectionSettings: Commitment | ConnectionConfig

  private availableProviders: Provider[] = []

  private provider: Provider | undefined

  public defaultChain: CaipNetwork | undefined = undefined

  public defaultSolanaChain: Chain | undefined = undefined

  public constructor(options: Web3ModalClientOptions) {
    const { solanaConfig, chains, defaultChain, connectionSettings = 'confirmed' } = options

    if (!solanaConfig) {
      throw new Error('web3modal:constructor - solanaConfig is undefined')
    }

    this.instanceOptions = options

    this.chains = chains

    this.connectionSettings = connectionSettings

    this.defaultChain = defaultChain
      ? SolHelpersUtil.getChainFromCaip(
          this.chains,
          SafeLocalStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) || defaultChain.chainId
        )
      : undefined
    this.defaultSolanaChain = this.chains.find(c => c.chainId === defaultChain?.chainId)

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (caipNetwork) {
          try {
            await this.switchNetwork(caipNetwork)
          } catch (error) {
            SolStoreUtil.setError(error)
          }
        }
      },

      getApprovedCaipNetworksData: async () => {
        if (SolStoreUtil.state.provider) {
          const approvedCaipNetworkIds = SolStoreUtil.state.provider.chains.map<CaipNetworkId>(
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
      connectWalletConnect: async onUri => {
        const wcProvider = this.availableProviders.find(
          provider => provider.type === 'WALLET_CONNECT'
        )

        if (!wcProvider || !(wcProvider instanceof WalletConnectProvider)) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        wcProvider.onUri = onUri

        return this.setProvider(wcProvider)
      },

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
        await SolStoreUtil.state.provider?.disconnect()
      },

      signMessage: async (message: string) => {
        const provider = SolStoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.signMessage(new TextEncoder().encode(message))

        return new TextDecoder().decode(signature)
      },

      estimateGas: async params => {
        if (params.chainNamespace !== 'solana') {
          throw new Error('Chain namespace is not supported')
        }

        const connection = SolStoreUtil.state.connection

        if (!connection) {
          throw new Error('Connection is not set')
        }

        const provider = this.getProvider()

        const transaction = await createSendTransaction({
          provider,
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

      sendTransaction: async params => {
        if (params.chainNamespace !== 'solana') {
          throw new Error('Chain namespace is not supported')
        }

        const connection = SolStoreUtil.state.connection
        const address = SolStoreUtil.state.address

        if (!connection || !address) {
          throw new Error('Connection is not set')
        }

        const provider = this.getProvider()

        const transaction = await createSendTransaction({
          provider,
          connection,
          to: params.to,
          value: params.value
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

        await this.syncBalance(address)

        return result
      },

      parseUnits: () => BigInt(0),

      formatUnits: () => ''
    }
  }

  public construct(appKit: AppKit, options: OptionsControllerState) {
    const { projectId } = options

    const clientOptions = this.instanceOptions

    if (!clientOptions) {
      throw new Error('Solana:construct - clientOptions is undefined')
    }

    this.appKit = appKit

    this.options = options

    const { chains } = clientOptions

    if (!projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }

    this.initializeProviders({
      relayUrl: SolConstantsUtil.UNIVERSAL_PROVIDER_RELAY_URL,
      metadata: clientOptions.metadata,
      projectId: options.projectId,
      ...clientOptions.solanaConfig.auth
    })

    if (this.defaultSolanaChain) {
      SolStoreUtil.setCurrentChain(this.defaultSolanaChain)
      SolStoreUtil.setCaipChainId(`solana:${this.defaultSolanaChain.chainId}`)
    }

    if (this.defaultChain) {
      this.appKit?.setCaipNetwork(this.defaultChain)
    }

    this.syncNetwork()
    this.syncRequestedNetworks(chains, this.options?.chainImages)

    SolStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    SolStoreUtil.subscribeKey('caipChainId', () => {
      this.syncNetwork()
    })

    SolStoreUtil.subscribeKey('isConnected', isConnected => {
      this.appKit?.setIsConnected(isConnected, 'solana')
    })

    AssetController.subscribeNetworkImages(() => {
      this.syncNetwork()
    })

    NetworkController.subscribeKey('caipNetwork', (newCaipNetwork?: CaipNetwork) => {
      const newChain = chains.find(_chain => _chain.chainId === newCaipNetwork?.id.split(':')[1])

      if (!newChain) {
        return
      }

      if (NetworkController.state.caipNetwork && !SolStoreUtil.state.isConnected) {
        SolStoreUtil.setCaipChainId(`solana:${newChain.chainId}`)
        SolStoreUtil.setCurrentChain(newChain)
        SafeLocalStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `solana:${newChain.chainId}`)
        ApiController.reFetchWallets()
      }
    })

    EventsController.subscribe(state => {
      if (state.data.event === 'SELECT_WALLET' && state.data.properties?.name === 'Phantom') {
        const isMobile = CoreHelperUtil.isMobile()
        const isClient = CoreHelperUtil.isClient()
        if (isMobile && isClient && !window.phantom) {
          const href = window.location.href
          const protocol = href.startsWith('https') ? 'https' : 'http'
          const host = href.split('/')[2]
          const ref = `${protocol}://${host}`
          window.location.href = `https://phantom.app/ul/browse/${href}?ref=${ref}`
        }
      }
    })
  }

  public disconnect() {
    return this.getProvider().disconnect()
  }

  public getAddress() {
    return SolStoreUtil.state.address
  }

  public getWalletProvider() {
    return SolStoreUtil.state.provider
  }

  public getWalletProviderType() {
    return SolStoreUtil.state.provider?.type
  }

  public getWalletConnection() {
    return SolStoreUtil.state.connection
  }

  // -- Private -----------------------------------------------------------------
  private syncConnectedWalletInfo() {
    const currentActiveWallet = SafeLocalStorage.getItem(SolConstantsUtil.WALLET_ID)
    const provider = SolStoreUtil.state.provider

    if (provider?.type === 'WALLET_CONNECT') {
      const wcProvider = provider as WalletConnectProvider
      if (wcProvider.session) {
        this.appKit?.setConnectedWalletInfo(
          {
            ...wcProvider.session.peer.metadata,
            name: wcProvider.session.peer.metadata.name,
            icon: wcProvider.session.peer.metadata.icons?.[0]
          },
          this.chain
        )
      }
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, this.chain)
    }
  }

  private async syncAccount() {
    const address = SolStoreUtil.state.address
    const chainId = SolStoreUtil.state.currentChain?.chainId

    if (address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.INJECTED_CONNECTOR_ID}:${chainId}:${address}`
      this.appKit?.setCaipAddress(caipAddress, this.chain)
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

    if (!SolStoreUtil.state.currentChain) {
      throw new Error('Chain is not set')
    }

    const balance =
      (await SolStoreUtil.state.connection.getBalance(new PublicKey(address))) /
      SolConstantsUtil.LAMPORTS_PER_SOL

    this.appKit?.setBalance(
      balance.toString(),
      SolStoreUtil.state.currentChain.currency,
      this.chain
    )
  }

  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `solana:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: this.chain
        }) as const
    )
    this.appKit?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chain)
  }

  public async switchNetwork(caipNetwork: CaipNetwork) {
    const caipChainId = caipNetwork.id

    if (this.provider instanceof AuthProvider) {
      await this.provider.switchNetwork(caipChainId)
    }

    const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId)
    SolStoreUtil.setCaipChainId(chain.id)
    SolStoreUtil.setCurrentChain(chain)
    SafeLocalStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, chain.id)

    await this.syncNetwork()
    await this.syncAccount()
  }

  private async syncNetwork() {
    const chainImages = this.options?.chainImages
    const address = SolStoreUtil.state.address
    const storeChainId = SolStoreUtil.state.caipChainId

    if (this.chains) {
      const chain = SolHelpersUtil.getChainFromCaip(this.chains, storeChainId)
      if (chain) {
        const caipChainId: CaipNetworkId = `solana:${chain.chainId}`

        SolStoreUtil.setConnection(
          new Connection(
            SolHelpersUtil.detectRpcUrl(chain, OptionsController.state.projectId),
            this.connectionSettings
          )
        )

        this.appKit?.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: this.chain
        })

        if (address) {
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/account/${address}`
            this.appKit?.setAddressExplorerUrl(url, this.chain)
          } else {
            this.appKit?.setAddressExplorerUrl(undefined, this.chain)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncBalance(address)
          }
        }
      }
    }
  }

  public subscribeProvider(callback: (newState: SolStoreUtilState) => void) {
    return SolStoreUtil.subscribe(callback)
  }

  private async setProvider(provider: Provider) {
    try {
      this.appKit?.setLoading(true)
      const address = await provider.connect()

      // Check if the provider supports the current chain or switch to the first supported chain
      const connectionChain =
        provider.chains.find(chain => chain.chainId === SolStoreUtil.state.currentChain?.chainId) ||
        provider.chains[0]

      if (!connectionChain) {
        provider.disconnect()
        throw new Error('The wallet does not support any of the required chains')
      }

      SolStoreUtil.setAddress(address)
      await this.switchNetwork(
        SolHelpersUtil.getChainFromCaip(this.chains, `solana:${connectionChain.chainId}`)
      )
      SolStoreUtil.setProvider(provider)
      this.provider = provider

      SafeLocalStorage.setItem(SolConstantsUtil.WALLET_ID, provider.name)

      await this.appKit?.setApprovedCaipNetworksData(this.chain)

      this.watchProvider(provider)
      SolStoreUtil.setIsConnected(true)
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
        if (!W3mFrameHelpers.checkIfRequestIsSafe(request)) {
          this.appKit.handleUnsafeRPCRequest()
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

    function disconnectHandler() {
      SafeLocalStorage.removeItem(SolConstantsUtil.WALLET_ID)
      SolStoreUtil.reset()

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('connect', accountsChangedHandler)
      provider.removeListener('auth_rpcRequest', rpcRequestHandler)
      provider.removeListener('auth_rpcSuccess', rpcSuccessHandler)
      provider.removeListener('auth_rpcError', rpcErrorHandler)
    }

    function accountsChangedHandler(publicKey: PublicKey) {
      const currentAccount: string = publicKey.toBase58()
      if (currentAccount) {
        SolStoreUtil.setAddress(currentAccount)
      } else {
        SafeLocalStorage.removeItem(SolConstantsUtil.WALLET_ID)
        SolStoreUtil.reset()
      }
    }

    provider.on('disconnect', disconnectHandler)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('connect', accountsChangedHandler)
    provider.on('auth_rpcRequest', rpcRequestHandler)
    provider.on('auth_rpcSuccess', rpcSuccessHandler)
    provider.on('auth_rpcError', rpcErrorHandler)
  }

  private getProvider() {
    if (!this.provider) {
      throw new Error('Provider is not set')
    }

    return this.provider
  }

  private async initializeProviders(opts: UniversalProviderOpts & Provider['auth']) {
    if (CoreHelperUtil.isClient()) {
      this.addProvider(
        new WalletConnectProvider({
          provider: await UniversalProvider.init(opts),
          chains: this.chains,
          getActiveChain: () => SolStoreUtil.state.currentChain
        })
      )

      if (opts.email || opts.socials?.length) {
        if (!opts.projectId) {
          throw new Error('projectId is required for AuthProvider')
        }

        this.addProvider(
          new AuthProvider({
            provider: new W3mFrameProvider(
              opts.projectId,
              withSolanaNamespace(SolStoreUtil.state.currentChain?.chainId)
            ),
            getActiveChain: () => SolStoreUtil.state.currentChain,
            auth: {
              email: opts.email,
              socials: opts.socials,
              showWallets: opts.showWallets,
              walletFeatures: opts.walletFeatures
            },
            chains: this.chains
          })
        )
      }

      watchStandard(standardAdapters => this.addProvider.bind(this)(...standardAdapters))
    }
  }

  private addProvider(...providers: Provider[]) {
    const activeProviderName = SafeLocalStorage.getItem(SolConstantsUtil.WALLET_ID)

    for (const provider of providers) {
      this.availableProviders = this.availableProviders.filter(p => p.name !== provider.name)
      this.availableProviders.push(provider)

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
      chain: CommonConstantsUtil.CHAIN.SOLANA,
      ...provider.auth
    }))

    this.appKit?.setConnectors(connectors)
  }
}
