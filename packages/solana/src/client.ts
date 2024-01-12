import { BN } from 'bn.js'
import type {
  CaipNetworkId,
  ConnectionControllerClient,
  LibraryOptions,
  NetworkControllerClient,
  Token,
  ScaffoldOptions,
  Connector,
  CaipAddress,
  CaipNetwork,
} from '@web3modal/scaffold'
import type {
  ProviderType,
  Metadata,
  Chain,
  Provider,
  Address
} from '@web3modal/scaffold-utils/solana'
import type { Connector as IConnector } from './connectors/BaseConnector'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import EthereumProvider from '@walletconnect/ethereum-provider'
import { SolStoreUtil, SolHelpersUtil, SolConstantsUtil } from '@web3modal/scaffold-utils/solana'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import { WalletConnectConnector } from './connectors/WalletConnectConnector'
import { PhantomConnector } from './connectors/phantom'
import { walletsImages } from './utils/walletsImages'

export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  solanaConfig: ProviderType
  siweConfig?: Web3ModalSIWEClient
  chains: Chain[]
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private WalletConnectConnector: IConnector

  private PhantomConnector: PhantomConnector

  private walletConnectProvider?: EthereumProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private projectId: string

  private chains: Chain[]

  private metadata?: Metadata

  public constructor(options: Web3ModalClientOptions) {
    const { solanaConfig, chains, tokens, _sdkVersion, chainImages, ...w3mOptions } = options

    if (!solanaConfig) {
      throw new Error('web3modal:constructor - solanaConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          try {
            await this.switchNetwork(chainId)
          } catch (error) {
            SolStoreUtil.setError(error)
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = localStorage.getItem(SolConstantsUtil.WALLET_ID)
          if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
            const provider = await this.getWalletConnectProvider()
            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - provider is undefined'
              )
            }
            const ns = provider.signer?.session?.namespaces
            const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
            const nsChains = ns?.[ConstantsUtil.EIP155]?.chains

            const result = {
              supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
              approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
            }

            resolve(result)
          } else {
            const result = {
              approvedCaipNetworkIds: undefined,
              supportsAllNetworks: true
            }

            resolve(result)
          }
        })
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WalletConnectProvider = await this.getWalletConnectProvider()
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        await WalletConnectProvider.connect()
        await this.setWalletConnectProvider()
      },

      connectExternal: async ({ id, provider, info }) => {
        const connector = this.getConnectors().find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }

        // TODO: refactor order
        SolStoreUtil.setIsConnected(true)
        const address = await this.PhantomConnector.connect()
        this.setInjectedProvider(provider as Provider, address)
      },

      checkInstalled(ids) {
        if (!ids) {
          return Boolean(window.originalSolana)
        }

        if (solanaConfig.injected) {
          if (!window?.originalSolana) {
            return false
          }
        }

        return ids.some(id => Boolean(window.originalSolana?.[String(id)]))
      },

      disconnect: async () => {
        const provider = SolStoreUtil.state.provider
        const providerType = SolStoreUtil.state.providerType
        localStorage.removeItem(SolConstantsUtil.WALLET_ID)
        SolStoreUtil.reset()
        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider
          await (WalletConnectProvider as unknown as EthereumProvider).disconnect()
        } else if (provider) {
          provider.emit('disconnect')
        }
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

        return signature as `0x${string}`
      }
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: chains[0],
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-solana-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    } as ScaffoldOptions)

    this.metadata = solanaConfig.metadata
    this.projectId = w3mOptions.projectId
    this.chains = chains
    SolStoreUtil.setProjectId(options.projectId)
    SolStoreUtil.setCurrentChain(chains[0] as Chain)

    this.WalletConnectConnector = new WalletConnectConnector({
      relayerRegion: 'wss://relay.walletconnect.com',
      metadata: {
        description: 'Solana in Wallet Connect',
        name: 'Wallet Connect',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        url: 'http://localhost:3000'
      },
      autoconnect: true,
      qrcode: false
    })

    this.PhantomConnector = new PhantomConnector()

    SolStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    SolStoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages)
    })
    this.syncRequestedNetworks(chains, chainImages)
    this.syncConnectors()
  }

  public setAddress(address?: string) {
    const originalAddress = address ? (SolStoreUtil.state.address as Address) : undefined
    SolStoreUtil.setAddress(originalAddress)
  }

  public getAddress() {
    const { address } = SolStoreUtil.state
    return address ? (SolStoreUtil.state.address as Address) : address
  }

  // -- Private -----------------------------------------------------------------
  private async syncConnectors() {
    const w3mConnectors: Connector[] = []

    /*const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID] as ConnectorType
     w3mConnectors.push({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      type: connectorType,
      imageUrl: 'https://avatars.githubusercontent.com/u/37784886',
      name: this.WalletConnectConnector.name,
      provider: await this.getWalletConnectProvider(),
      info: {
        rdns: ''
      }
    }) */

    if (window.solana) {
      w3mConnectors.push({
        id: this.PhantomConnector.id,
        type: 'ANNOUNCED',
        imageUrl: walletsImages['phantom'],
        name: this.PhantomConnector.name,
        provider: await this.PhantomConnector.getProvider(),
        info: {
          rdns: 'app.phantom',
        }
      })
    }
    this.setConnectors(w3mConnectors)
  }

  private createProvider() {
    if (!this.walletConnectProviderInitPromise && typeof window !== 'undefined') {
      this.walletConnectProviderInitPromise = this.initWalletConnectProvider()
    }

    return this.walletConnectProviderInitPromise
  }

  private async initWalletConnectProvider() {
    const walletConnectProviderOptions: EthereumProviderOptions = {
      projectId: this.projectId,
      showQrModal: false,
      rpcMap: this.chains
        ? this.chains.reduce<Record<number, string>>((map, chain) => {
          map[chain.chainId] = chain.rpcUrl

          return map
        }, {})
        : ({} as Record<number, string>),
      optionalChains: [...this.chains.map(chain => chain.chainId)] as [number],
      metadata: {
        name: this.metadata ? this.metadata.name : '',
        description: this.metadata ? this.metadata.description : '',
        url: this.metadata ? this.metadata.url : '',
        icons: this.metadata ? this.metadata.icons : ['']
      }
    }

    this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)

    await this.checkActiveWalletConnectProvider()
  }

  private async watchWalletConnect() {
    const WalletConnectProvider = await this.getWalletConnectProvider()

    function disconnectHandler() {
      localStorage.removeItem(SolConstantsUtil.WALLET_ID)
      SolStoreUtil.reset()

      WalletConnectProvider?.removeListener('disconnect', disconnectHandler)
      WalletConnectProvider?.removeListener('accountsChanged', accountsChangedHandler)
      WalletConnectProvider?.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = SolHelpersUtil.hexStringToNumber(chainId)
        SolStoreUtil.setChainId(chain)
      }
    }

    const accountsChangedHandler = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await this.setWalletConnectProvider()
      }
    }

    if (WalletConnectProvider) {
      WalletConnectProvider.on('disconnect', disconnectHandler)
      WalletConnectProvider.on('accountsChanged', accountsChangedHandler)
      WalletConnectProvider.on('chainChanged', chainChangedHandler)
    }
  }

  private async setWalletConnectProvider() {
    window?.localStorage.setItem(
      SolConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    const WalletConnectProvider = await this.getWalletConnectProvider()
    if (WalletConnectProvider) {
      SolStoreUtil.setChainId(WalletConnectProvider.chainId)
      SolStoreUtil.setProviderType('walletConnect')
      SolStoreUtil.setProvider(WalletConnectProvider as unknown as Provider)
      SolStoreUtil.setIsConnected(true)
      this.setAddress(WalletConnectProvider.accounts?.[0])
      this.watchWalletConnect()
    }
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }
  }

  private async getWalletConnectProvider() {
    if (!this.walletConnectProvider) {
      try {
        await this.createProvider()
      } catch (error) {
        SolStoreUtil.setError(error)
      }
    }

    return this.walletConnectProvider
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

      await Promise.all([
        this.syncProfile(),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  private async syncProfile() {
    this.setProfileName(null)
    this.setProfileImage(null)
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = SolStoreUtil.state.address
    const chainId = SolStoreUtil.state.chainId
    const isConnected = SolStoreUtil.state.isConnected
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chain.chainId}`

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        })
        if (isConnected && address) {
          const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`
          this.setCaipAddress(caipAddress)
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/account/${address}`
            this.setAddressExplorerUrl(url)
          } else {
            this.setAddressExplorerUrl(undefined)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncProfile()
            await this.syncBalance(address)
          }
        }
      }
    }
  }

  private async syncBalance(address: string) {
    const chainId = SolStoreUtil.state.chainId
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)
      if (chain) {
        const balance = await this.WalletConnectConnector.getBalance(address) ?? { value: new BN('0') }
        // const balance = { value: '0' }// await this.PhantomConnector.getBalance(address) ?? { value: new BN('0') }
        // const formatted = `${balance.value} sol`
        console.log(balance);

        this.setBalance(balance.value.toString(), chain.currency)
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
          id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async switchNetwork(chainId: number) {
    const provider = SolStoreUtil.state.provider
    const providerType = SolStoreUtil.state.providerType
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SolHelpersUtil.numberToHexString(chain.chainId) }]
            })

            SolStoreUtil.setChainId(chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === SolConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
              SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await SolHelpersUtil.addSolanaChain(
                WalletConnectProvider as unknown as Provider,
                chain
              )
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID && chain) {
        const InjectedProvider = provider
        if (InjectedProvider) {
          try {
            await InjectedProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SolHelpersUtil.numberToHexString(chain.chainId) }]
            })
            SolStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === SolConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
              SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await SolHelpersUtil.addSolanaChain(InjectedProvider, chain)
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && chain) {
        const EIP6963Provider = provider

        if (EIP6963Provider) {
          try {
            await EIP6963Provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SolHelpersUtil.numberToHexString(chain.chainId) }]
            })
            SolStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === SolConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
              SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await SolHelpersUtil.addSolanaChain(EIP6963Provider, chain)
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.COINBASE_CONNECTOR_ID && chain) {
        const CoinbaseProvider = provider
        if (CoinbaseProvider) {
          try {
            await CoinbaseProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SolHelpersUtil.numberToHexString(chain.chainId) }]
            })
            SolStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === SolConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
              SolConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await SolHelpersUtil.addSolanaChain(CoinbaseProvider, chain)
            }
          }
        }
      }
    }
  }

  private async setInjectedProvider(provider: Provider, address: Address) {
    window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)

    const chainId = SolStoreUtil.state.currentChain?.chainId
    if (address && chainId) {
      SolStoreUtil.setChainId(chainId)
      SolStoreUtil.setProviderType('injected')
      SolStoreUtil.setProvider(provider)
      SolStoreUtil.setIsConnected(true)
      this.setAddress(address)

      await Promise.all([
        this.syncProfile(),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ])

      this.hasSyncedConnectedAccount = true
    }
  }
}
