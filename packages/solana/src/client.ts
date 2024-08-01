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
import { ConstantsUtil as CommonConstantsUtil, NetworkUtil } from '@web3modal/common'

import { SolConstantsUtil, SolHelpersUtil, SolStoreUtil } from './utils/scaffold/index.js'
import { WalletConnectConnector } from './connectors/walletConnectConnector.js'

import type { BaseWalletAdapter, StandardWalletAdapter } from '@solana/wallet-adapter-base'
import type { PublicKey, Commitment, ConnectionConfig } from '@solana/web3.js'
import type UniversalProvider from '@walletconnect/universal-provider'
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
import { watchStandard } from './utils/wallet-standard/watchStandard.js'
import { SolanaAuthClient } from './auth-client.js'
import type { ISolanaModal } from './solana-interface.js'

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
export class Web3Modal extends Web3ModalScaffold implements ISolanaModal {
  private hasSyncedConnectedAccount = false

  private WalletConnectConnector: WalletConnectConnector
  private walletAdapters: ExtendedBaseWalletAdapter[]
  private filteredWalletAdapters: ExtendedBaseWalletAdapter[] | undefined

  private chains: Chain[]

  private chain: AvailableChain = CommonConstantsUtil.CHAIN.SOLANA

  public connectionSettings: Commitment | ConnectionConfig

  private authClient: SolanaAuthClient

  private solanaConfig: ProviderType

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
        console.log('switching network to', caipNetwork)
        if (caipNetwork) {
          try {
            // Update chain for Solflare
            this.walletAdapters = wallets as ExtendedBaseWalletAdapter[]
            const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)
            const wallet = walletId?.split('_')[1]
            if (wallet === 'solflare' && window[wallet as keyof Window]) {
              const adapter = this.walletAdapters.find(a => a.name.toLocaleLowerCase() === wallet)
              if (!adapter) {
                return
              }
              await adapter.connect()
              this.setInjectedProvider(adapter as unknown as Provider)
            }

            await this.switchNetwork(caipNetwork)
          } catch (error) {
            SolStoreUtil.setError(error)
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(resolve => {
          const result = {
            approvedCaipNetworkIds: undefined,
            supportsAllNetworks: true
          }

          resolve(result)
        })
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WalletConnectProvider = await this.WalletConnectConnector.getProvider()
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        WalletConnectProvider.on('display_uri', onUri)
        const address = await this.WalletConnectConnector.connect()
        this.setWalletConnectProvider(address)
        WalletConnectProvider.removeListener('display_uri', onUri)
      },

      connectExternal: async ({ id }) => {
        if (id === ConstantsUtil.AUTH_CONNECTOR_ID) {
          await this.authClient.connect()

          return
        }

        const adapter = this.filteredWalletAdapters?.find(
          a => a.name.toLocaleLowerCase() === id.toLocaleLowerCase()
        )

        if (!adapter) {
          throw Error('connectionControllerClient:connectExternal - adapter was undefined')
        }
        await adapter.connect()
        this.setInjectedProvider(adapter as unknown as Provider)
      },

      disconnect: async () => {
        const provider = SolStoreUtil.state.provider as Provider
        const providerType = SolStoreUtil.state.providerType
        localStorage.removeItem(SolConstantsUtil.WALLET_ID)
        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider
          await (WalletConnectProvider as unknown as UniversalProvider).disconnect()
        } else if (provider) {
          provider.emit('disconnect')
        }
        SolStoreUtil.reset()
      },

      signMessage: async (message: string) => {
        const provider = SolStoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, this.getAddress()]
        })

        return signature as string
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

    this.authClient = new SolanaAuthClient({
      modal: this,
      projectId: w3mOptions.projectId
    })

    this.chains = chains
    this.connectionSettings = connectionSettings
    this.syncRequestedNetworks(chains, chainImages)
    this.solanaConfig = solanaConfig

    const chain = SolHelpersUtil.getChainFromCaip(
      chains,
      typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )

    if (chain) {
      SolStoreUtil.setCurrentChain(chain)
      SolStoreUtil.setCaipChainId(`solana:${chain.chainId}`)
    }
    this.syncNetwork(chainImages)

    this.walletAdapters = wallets as ExtendedBaseWalletAdapter[]
    this.WalletConnectConnector = new WalletConnectConnector({
      relayerRegion: 'wss://relay.walletconnect.com',
      metadata,
      chains,
      qrcode: true
    })
    SolStoreUtil.setConnection(
      new Connection(
        SolHelpersUtil.detectRpcUrl(chain, OptionsController.state.projectId),
        this.connectionSettings
      )
    )

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

    if (CoreHelperUtil.isClient()) {
      this.checkActiveProviders()
      this.syncStandardAdapters()
      watchStandard(standardAdapters => {
        const uniqueIds = standardAdapters
          ? new Set(standardAdapters.map(s => s.name))
          : new Set([])
        this.filteredWalletAdapters = [
          ...standardAdapters,
          ...this.walletAdapters.filter(
            adapter => !uniqueIds.has(adapter.name) && uniqueIds.add(adapter.name)
          )
        ]
        this.checkActiveProviders.bind(this)(standardAdapters)
        this.syncStandardAdapters.bind(this)(standardAdapters)
      })
    }
  }

  public setAddress(address?: string) {
    SolStoreUtil.setAddress(address ?? '')
  }

  public disconnect() {
    const provider = SolStoreUtil.state.provider as Provider

    if (provider) {
      provider.emit('disconnect')
    }
  }

  public getAddress() {
    const { address } = SolStoreUtil.state

    return address ? SolStoreUtil.state.address : address
  }

  public getWalletProvider() {
    return SolStoreUtil.state.provider
  }

  public getWalletProviderType() {
    return SolStoreUtil.state.providerType
  }

  public getWalletConnection() {
    return SolStoreUtil.state.connection
  }

  public async checkActiveProviders(standardAdapters?: StandardWalletAdapter[]) {
    const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)

    if (!walletId) {
      return
    }

    try {
      switch (walletId) {
        case ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID: {
          const provider = await this.WalletConnectConnector.getProvider()
          if (provider.session) {
            const account = provider.session.namespaces['solana']?.accounts[0]
            this.setWalletConnectProvider(account?.split(':')[2])
          }

          break
        }
        case ConstantsUtil.AUTH_CONNECTOR_ID: {
          await this.authClient.connect()

          break
        }
        default: {
          const walletArray = walletId?.split('_') ?? []
          if (walletArray[0] === 'announced' && standardAdapters) {
            const adapter = standardAdapters.find(a => a.name === walletArray[1])

            if (adapter) {
              await adapter.connect()
              this.setInjectedProvider(adapter as unknown as Provider)

              return
            }
          } else if (walletArray[0] === 'injected') {
            const adapter = [...(standardAdapters ?? []), ...this.walletAdapters].find(
              a => a.name === walletArray[1]
            ) as ExtendedBaseWalletAdapter
            await adapter.connect()
            this.setInjectedProvider(adapter as unknown as Provider)

            return
          }

          throw new Error('AppKit:checkActiveProviders - Invalid type in walletId')
        }
      }
    } catch (error) {
      SolStoreUtil.setError(error)
    }
  }

  public handleConnection(params: ISolanaModal.HandleConnectionParams) {
    const {
      connectorId,
      caipChainId,
      providerType,
      provider,
      address,
      accounts,
      smartAccountEnabledNetworks,
      smartAccountDeployed
    } = params
    window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, connectorId)

    SolStoreUtil.setIsConnected(true)
    SolStoreUtil.setCaipChainId(caipChainId)
    SolStoreUtil.setProviderType(providerType)
    SolStoreUtil.setProvider(provider)
    SolStoreUtil.setAddress(address)

    if (typeof accounts !== 'undefined') {
      this.setAllAccounts(accounts, this.chain)
    }

    if (typeof smartAccountEnabledNetworks !== 'undefined') {
      this.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, this.chain)
    }

    if (typeof smartAccountDeployed !== 'undefined') {
      this.setSmartAccountDeployed(smartAccountDeployed, this.chain)
    }

    return this.syncAccount()
  }

  // -- Private -----------------------------------------------------------------
  private syncStandardAdapters(standardAdapters?: StandardWalletAdapter[]) {
    const w3mConnectors: Connector[] = []

    const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]
    if (connectorType) {
      w3mConnectors.push({
        id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        type: connectorType,
        imageUrl: 'https://avatars.githubusercontent.com/u/37784886',
        name: this.WalletConnectConnector.name,
        provider: this.WalletConnectConnector.getProvider(),
        chain: this.chain
      })
    }

    const uniqueIds = standardAdapters ? new Set(standardAdapters.map(s => s.name)) : new Set([])
    const FILTER_OUT_ADAPTERS = ['Trust']
    const filteredAdapters = this.walletAdapters
      .filter(adapter => FILTER_OUT_ADAPTERS.some(filter => filter === adapter.name))
      .filter(adapter => !uniqueIds.has(adapter.name) && uniqueIds.add(adapter.name))

    standardAdapters?.forEach(adapter => {
      w3mConnectors.push({
        id: adapter.name,
        type: 'ANNOUNCED',
        imageUrl: adapter.icon,
        name: adapter.name,
        provider: adapter,
        chain: CommonConstantsUtil.CHAIN.SOLANA
      })
    })
    filteredAdapters.forEach(adapter => {
      w3mConnectors.push({
        id: adapter.name,
        type: 'EXTERNAL',
        imageUrl: adapter.icon,
        name: adapter.name,
        provider: adapter,
        chain: CommonConstantsUtil.CHAIN.SOLANA
      })
    })

    w3mConnectors.push(this.authClient.getConnector())

    this.setConnectors(w3mConnectors)
  }

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
    const caipChainId = SolStoreUtil.state.caipChainId
    if (caipChainId && this.chains) {
      const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId)
      if (chain) {
        const balance = await this.WalletConnectConnector.getBalance(address)
        this.setBalance(balance.decimals.toString(), chain.currency)
      }
    }
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
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  public async switchNetwork(caipNetwork: CaipNetwork) {
    const caipChainId = caipNetwork.id
    const providerType = SolStoreUtil.state.providerType
    const provider = SolStoreUtil.state.provider
    const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId)

    if (chain) {
      SolStoreUtil.setCaipChainId(`solana:${chain.chainId}`)
      SolStoreUtil.setCurrentChain(chain)
      localStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `solana:${chain.chainId}`)
      if (!providerType) {
        throw new Error('connectionControllerClient:switchNetwork - providerType is undefined')
      }
      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        const universalProvider = await this.WalletConnectConnector.getProvider()

        const namespaces = this.WalletConnectConnector.generateNamespaces(chain.chainId)
        SolStoreUtil.setConnection(
          new Connection(
            SolHelpersUtil.detectRpcUrl(chain, OptionsController.state.projectId),
            this.connectionSettings
          )
        )
        universalProvider.connect({ namespaces, pairingTopic: undefined })
        await this.syncAccount()
      } else {
        SolStoreUtil.setConnection(
          new Connection(
            SolHelpersUtil.detectRpcUrl(chain, OptionsController.state.projectId),
            this.connectionSettings
          )
        )
        const name = provider ? (provider as Provider).name : ''
        this.setAddress(
          this.filteredWalletAdapters?.find(adapter => adapter.name === name)?.publicKey?.toString()
        )
        await this.syncAccount()
      }
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

  private async setWalletConnectProvider(address = '') {
    const caipChainId = `${SolStoreUtil.state.currentChain?.name}: ${SolStoreUtil.state.currentChain?.chainId}`
    const chain = SolHelpersUtil.getChainFromCaip(
      this.chains,
      typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ''
    )
    if (chain) {
      SolStoreUtil.setCurrentChain(chain)
    }

    this.handleConnection({
      connectorId: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      caipChainId,
      providerType: 'walletConnect',
      provider: this.WalletConnectConnector as unknown as Provider,
      address
    })

    await Promise.all([this.syncBalance(address), this.setApprovedCaipNetworksData()])
  }

  public getChainId() {
    const storeChainId = SolStoreUtil.state.currentChain?.chainId

    if (storeChainId) {
      return storeChainId
    }

    return this.getCaipNetwork()?.id
  }

  private setInjectedProvider(provider: Provider) {
    const id = SolHelpersUtil.getStorageInjectedId(provider as unknown as ExtendedBaseWalletAdapter)
    const address = provider.publicKey?.toString()
    const chainId = SolStoreUtil.state.currentChain?.chainId

    if (address && chainId) {
      this.handleConnection({
        connectorId: id,
        providerType: id,
        caipChainId: `solana:${chainId}`,
        provider,
        address
      })

      this.watchInjected(provider)
      this.hasSyncedConnectedAccount = true
    }
  }

  private watchInjected(provider: Provider) {
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
}
