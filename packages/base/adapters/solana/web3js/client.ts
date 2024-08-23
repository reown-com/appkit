import { Connection } from '@solana/web3.js'
import {
  ApiController,
  AssetController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  OptionsController
} from '@web3modal/core'
import { PresetsUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

import { SolConstantsUtil, SolHelpersUtil, SolStoreUtil } from '@web3modal/scaffold-utils/solana'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import UniversalProvider, { type UniversalProviderOpts } from '@walletconnect/universal-provider'
import type {
  ConnectionControllerClient,
  NetworkControllerClient,
  Connector
} from '@web3modal/core'
import type { CaipAddress, CaipNetwork, CaipNetworkId } from '@web3modal/common'
import type { ChainNamespace } from '@web3modal/common'

import type { ProviderType, Provider, SolStoreUtilState } from '@web3modal/scaffold-utils/solana'
import { watchStandard } from './utils/watchStandard.js'
import { WalletConnectProvider } from './providers/WalletConnectProvider.js'
import type { AppKit } from '../../../src/client.js'
import type { AppKitOptions } from '../../../utils/TypesUtil.js'

export interface AdapterOptions {
  solanaConfig: ProviderType
  connectionSettings?: Commitment | ConnectionConfig
  defaultCaipNetwork?: CaipNetwork
  wallets?: BaseWalletAdapter[]
}

export type ExtendedBaseWalletAdapter = BaseWalletAdapter & {
  isAnnounced: boolean
}
export type Web3ModalOptions = Omit<AdapterOptions, '_sdkVersion' | 'isUniversalProvider'>

// -- Client --------------------------------------------------------------------
export class SolanaWeb3JsClient {
  private appKit: AppKit | undefined = undefined

  public options: AppKitOptions | undefined = undefined

  private hasSyncedConnectedAccount = false

  private caipNetworks: CaipNetwork[] = []

  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.SOLANA

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public connectionSettings: Commitment | ConnectionConfig

  private availableProviders: Provider[] = []

  private provider: Provider | undefined

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  public constructor(options: AdapterOptions) {
    const { solanaConfig, connectionSettings = 'confirmed' } = options

    if (!solanaConfig) {
      throw new Error('web3modal:constructor - solanaConfig is undefined')
    }

    this.connectionSettings = connectionSettings

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
        const wagmiAdapter = this.appKit?.adapters?.find(adapter => adapter.adapterType === 'wagmi')
        if (wagmiAdapter) {
          wagmiAdapter.connectionControllerClient?.connectWalletConnect(onUri)
        } else {
          this.appKit?.universalAdapter?.connectionControllerClient.connectWalletConnect(onUri)
        }
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

    this.initializeProviders({
      relayUrl: 'wss://relay.walletconnect.com',
      metadata: options.metadata,
      projectId: options.projectId
    })

    this.syncRequestedNetworks(caipNetworks)

    const chain = SolHelpersUtil.getChainFromCaip(
      caipNetworks,
      typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )

    this.defaultCaipNetwork = chain
    this.syncRequestedNetworks(caipNetworks)

    if (chain) {
      SolStoreUtil.setCurrentChain(chain)
      SolStoreUtil.setCaipChainId(`solana:${chain.chainId}`)
    }
    this.syncNetwork()

    SolStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    SolStoreUtil.subscribeKey('caipChainId', () => {
      this.syncNetwork()
    })

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

      if (NetworkController.state.caipNetwork && !SolStoreUtil.state.isConnected) {
        SolStoreUtil.setCaipChainId(`solana:${newChain.chainId}`)
        SolStoreUtil.setCurrentChain(newChain)
        localStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `solana:${newChain.chainId}`)
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

  public setAddress(address = '') {
    SolStoreUtil.setAddress(address)
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
  private async syncAccount() {
    const address = SolStoreUtil.state.address
    const chainId = SolStoreUtil.state.currentChain?.chainId
    const isConnected = SolStoreUtil.state.isConnected
    this.appKit?.resetAccount(this.chainNamespace)

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `solana:${chainId}:${address}`
      this.appKit?.setIsConnected(isConnected, this.chainNamespace)
      this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
      await this.syncBalance(address)

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
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
      this.chainNamespace
    )
  }

  private syncRequestedNetworks(caipNetworks: CaipNetwork[]) {
    const uniqueChainNamespaces = [
      ...new Set(caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))
    ]
    uniqueChainNamespaces.forEach(chainNamespace => {
      this.appKit?.setRequestedCaipNetworks(
        caipNetworks.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace),
        chainNamespace
      )
    })
  }

  public async switchNetwork(caipNetwork: CaipNetwork) {
    const caipChainId = caipNetwork.id
    const chain = SolHelpersUtil.getChainFromCaip(this.caipNetworks, caipChainId)
    SolStoreUtil.setCaipChainId(chain.id)
    SolStoreUtil.setCurrentChain(chain)
    localStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, chain.id)

    await this.syncNetwork()
    await this.syncAccount()
  }

  private async syncNetwork() {
    const chainImages = this.options?.chainImages
    const address = SolStoreUtil.state.address
    const storeChainId = SolStoreUtil.state.caipChainId
    const isConnected = SolStoreUtil.state.isConnected

    if (this.caipNetworks) {
      const chain = SolHelpersUtil.getChainFromCaip(this.caipNetworks, storeChainId)
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
          imageId: PresetsUtil.NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chainNamespace: this.chainNamespace
        } as CaipNetwork)
        if (isConnected && address) {
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/account/${address}`
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

      if (connectionChain) {
        await this.switchNetwork(
          SolHelpersUtil.getChainFromCaip(this.caipNetworks, `solana:${connectionChain.chainId}`)
        )
      } else {
        provider.disconnect()
        throw new Error('The wallet does not support any of the required chains')
      }

      SolStoreUtil.setIsConnected(true)
      SolStoreUtil.setProvider(provider)
      this.provider = provider
      this.setAddress(address)

      window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, provider.name)

      await this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)

      this.watchProvider(provider)
    } finally {
      this.appKit?.setLoading(false)
    }
  }

  private watchProvider(provider: Provider) {
    function disconnectHandler() {
      localStorage.removeItem(SolConstantsUtil.WALLET_ID)
      SolStoreUtil.reset()

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('connect', accountsChangedHandler)
    }

    function accountsChangedHandler(publicKey: PublicKey) {
      const currentAccount: string = publicKey.toBase58()
      if (currentAccount) {
        SolStoreUtil.setAddress(currentAccount)
      } else {
        localStorage.removeItem(SolConstantsUtil.WALLET_ID)
        SolStoreUtil.reset()
      }
    }

    provider.on('disconnect', disconnectHandler)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('connect', accountsChangedHandler)
  }

  private getProvider() {
    if (!this.provider) {
      throw new Error('Provider is not set')
    }

    return this.provider
  }

  private async initializeProviders(opts: UniversalProviderOpts) {
    if (CoreHelperUtil.isClient()) {
      this.addProvider(
        new WalletConnectProvider({
          provider: await UniversalProvider.init(opts),
          chains: this.caipNetworks,
          getActiveChain: () => SolStoreUtil.state.currentChain
        })
      )

      watchStandard(standardAdapters => this.addProvider.bind(this)(...standardAdapters))
    }
  }

  private addProvider(...providers: Provider[]) {
    const activeProviderName = localStorage.getItem(SolConstantsUtil.WALLET_ID)

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
