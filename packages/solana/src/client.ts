import { Connection } from '@solana/web3.js'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import {
  ApiController,
  AssetController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  OptionsController
} from '@web3modal/core'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'

import { SolConstantsUtil, SolHelpersUtil, SolStoreUtil } from './utils/scaffold/index.js'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import UniversalProvider, { type UniversalProviderOpts } from '@walletconnect/universal-provider'
import type {
  CaipNetworkId,
  ConnectionControllerClient,
  LibraryOptions,
  NetworkControllerClient,
  Token,
  ScaffoldOptions,
  Connector,
  CaipAddress,
  CaipNetwork
} from '@web3modal/scaffold'
import type { Chain as AvailableChain } from '@web3modal/common'

import type { ProviderType, Chain, Provider, SolStoreUtilState } from './utils/scaffold/index.js'
import { watchStandard } from './utils/watchStandard.js'
import { WalletConnectProvider } from './providers/WalletConnectProvider.js'

export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  solanaConfig: ProviderType
  chains: Chain[]
  connectionSettings?: Commitment | ConnectionConfig
  defaultChain?: Chain
  chainImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
  wallets?: BaseWalletAdapter[]
}

export type ExtendedBaseWalletAdapter = BaseWalletAdapter & {
  isAnnounced: boolean
}
export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion' | 'isUniversalProvider'>

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private chains: Chain[]

  private chain: AvailableChain = CommonConstantsUtil.CHAIN.SOLANA

  public connectionSettings: Commitment | ConnectionConfig

  private availableProviders: Provider[] = []
  private provider: Provider | undefined

  public constructor(options: Web3ModalClientOptions) {
    const {
      solanaConfig,
      chains,
      tokens,
      _sdkVersion,
      chainImages,
      connectionSettings = 'confirmed',
      ...w3mOptions
    } = options
    const wallets = options.wallets ?? []

    const { metadata } = solanaConfig

    if (!solanaConfig) {
      throw new Error('web3modal:constructor - solanaConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
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

    const connectionControllerClient: ConnectionControllerClient = {
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

    super({
      chain: CommonConstantsUtil.CHAIN.SOLANA,
      networkControllerClient,
      connectionControllerClient,
      supportedWallets: wallets,

      defaultChain: SolHelpersUtil.getChainFromCaip(
        chains,
        typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
      ) as CaipNetwork,
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-solana-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    } as ScaffoldOptions)

    this.initializeProviders({
      relayUrl: 'wss://relay.walletconnect.com',
      metadata,
      projectId: w3mOptions.projectId
    })

    this.chains = chains
    this.connectionSettings = connectionSettings
    this.syncRequestedNetworks(chains, chainImages)

    const chain = SolHelpersUtil.getChainFromCaip(
      chains,
      typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )
    if (chain) {
      SolStoreUtil.setCurrentChain(chain)
      SolStoreUtil.setCaipChainId(`solana:${chain.chainId}`)
    }
    this.syncNetwork(chainImages)

    SolStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    SolStoreUtil.subscribeKey('caipChainId', () => {
      this.syncNetwork(chainImages)
    })

    AssetController.subscribeNetworkImages(() => {
      this.syncNetwork(chainImages)
    })

    NetworkController.subscribeKey('caipNetwork', (newCaipNetwork: CaipNetwork | undefined) => {
      const newChain = chains.find(_chain => _chain.chainId === newCaipNetwork?.id.split(':')[1])

      if (!newChain) {
        throw new Error('The selected chain is not a valid Solana chain')
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
    this.resetAccount()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.INJECTED_CONNECTOR_ID}:${chainId}:${address}`
      this.setIsConnected(isConnected)
      this.setCaipAddress(caipAddress)
      await Promise.all([this.syncBalance(address)])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
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

    this.setBalance(balance.toString(), SolStoreUtil.state.currentChain.currency)
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
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  public async switchNetwork(caipNetwork: CaipNetwork) {
    const caipChainId = caipNetwork.id
    const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId)

    if (chain) {
      SolStoreUtil.setCaipChainId(`solana:${chain.chainId}`)
      SolStoreUtil.setCurrentChain(chain)
      localStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `solana:${chain.chainId}`)

      this.setLoading(true)
      await this.syncNetwork()
      await this.syncAccount()
      this.setLoading(false)
    }
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = SolStoreUtil.state.address
    const storeChainId = SolStoreUtil.state.caipChainId
    const isConnected = SolStoreUtil.state.isConnected

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

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: this.chain
        })
        if (isConnected && address) {
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/account/${address}`
            this.setAddressExplorerUrl(url)
          } else {
            this.setAddressExplorerUrl(undefined)
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
    const address = await provider.connect()

    const caipChainId = `${SolStoreUtil.state.currentChain?.name}:${SolStoreUtil.state.currentChain?.chainId}`
    const chain = SolHelpersUtil.getChainFromCaip(
      this.chains,
      typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )
    if (chain) {
      SolStoreUtil.setCurrentChain(chain)
    }
    SolStoreUtil.setIsConnected(true)
    SolStoreUtil.setCaipChainId(caipChainId)
    SolStoreUtil.setProvider(provider)
    this.setAddress(address)

    window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, provider.name)

    await Promise.all([this.syncBalance(address), this.setApprovedCaipNetworksData()])

    this.watchProvider(provider)
  }

  private watchProvider(provider: Provider) {
    function disconnectHandler() {
      localStorage.removeItem(SolConstantsUtil.WALLET_ID)
      SolStoreUtil.reset()

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('connect', accountsChangedHandler)
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

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('connect', accountsChangedHandler)
    }
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
          chains: this.chains,
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
      chain: CommonConstantsUtil.CHAIN.SOLANA
    }))

    this.setConnectors(connectors)
  }
}
