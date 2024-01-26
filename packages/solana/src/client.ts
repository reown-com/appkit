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
  ConnectorType,
} from '@web3modal/scaffold'
import type {
  ProviderType,
  Chain,
  Provider,
  Address
} from '@web3modal/scaffold-utils/solana'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import { WalletAdapterNetwork, type BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import UniversalProvider from '@walletconnect/universal-provider'
import EthereumProvider from '@walletconnect/ethereum-provider'
import { SolStoreUtil, SolHelpersUtil, SolConstantsUtil } from '@web3modal/scaffold-utils/solana'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils'

import { WalletConnectConnector } from './connectors/WalletConnectConnector'
import { PhantomConnector } from './connectors/phantom'

type AdapterKey = 'walletConnect' | 'phantom' | 'solflare'
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  solanaConfig: ProviderType
  siweConfig?: Web3ModalSIWEClient
  chains: Chain[]
  defaultChain?: Chain
  chainImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private WalletConnectConnector: WalletConnectConnector

  private PhantomConnector: PhantomConnector

  private walletAdapters: Record<AdapterKey, BaseMessageSignerWalletAdapter>;

  private chains: Chain[]

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
            const result = {
              approvedCaipNetworkIds: undefined,
              supportsAllNetworks: true
            }
            /* const provider = await this.WalletConnectConnector.getProvider()
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

            resolve(result) */
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
        const WalletConnectProvider = await this.WalletConnectConnector.getProvider()
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })
        const address = await this.WalletConnectConnector.connect()
        this.setWalletConnectProvider(await this.WalletConnectConnector.getProvider(), address as Address)
      },

      connectExternal: async ({ id, info }) => {
        switch (id) {
          case 'Phantom': {
            await this.walletAdapters.phantom.connect()
            const address = this.walletAdapters.phantom.publicKey?.toString() as Address
            this.setInjectedProvider(this.walletAdapters.phantom as unknown as Provider, address)
            break
          }
          case 'Solflare': {
            await this.walletAdapters.solflare.connect()
            const address = this.walletAdapters.solflare.publicKey?.toString() as Address
            this.setInjectedProvider(this.walletAdapters.solflare as unknown as Provider, address)
            break
          }
        }

      },

      checkInstalled(ids) {
        if (!ids) {
          return Boolean(window.solana)
        }

        if (solanaConfig.injected) {
          if (!window?.originalSolana) {
            return false
          }
        }

        return ids.some(id => Boolean(window.solana?.[String(id)]))
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
        console.log(`message`, message);
        const provider = SolStoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }
        console.log(`sign message`);

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
      defaultChain: chains[2],
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-solana-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    } as ScaffoldOptions)

    this.chains = chains
    SolStoreUtil.setProjectId(options.projectId)
    SolStoreUtil.setCurrentChain(chains[2] as Chain)

    this.walletAdapters = {
      phantom: new PhantomWalletAdapter(),
      walletConnect: new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet, options: {
          projectId: process.env['NEXT_PUBLIC_PROJECT_ID'],
          relayUrl: 'wss://relay.walletconnect.com',
        },
      }),
      solflare: new SolflareWalletAdapter()
    }
    this.WalletConnectConnector = new WalletConnectConnector({
      relayerRegion: 'wss://relay.walletconnect.com',
      metadata: {
        description: 'Solana in Wallet Connect',
        name: 'Wallet Connect',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        url: 'https://web3modal.com',
      },
      autoconnect: true,
      qrcode: true
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

    if (typeof window === 'object') {
      setTimeout(() => {
        this.checkActiveProviders()
      }, 500)
    }
  }

  public setAddress(address?: Address) {
    SolStoreUtil.setAddress(address ?? '')
  }

  public getAddress() {
    const { address } = SolStoreUtil.state
    return address ? (SolStoreUtil.state.address as Address) : address
  }

  public disconnect() {
    console.log(`disconnect hook triggers`);
  }

  public async checkActiveProviders() {
    const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)

    try {
      switch (walletId) {
        case ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID: {
          const address = await this.WalletConnectConnector.connect(true)
          this.setWalletConnectProvider(await this.WalletConnectConnector.getProvider(), address as Address)
          break;
        }
        case ConstantsUtil.INJECTED_CONNECTOR_ID: {
          await this.walletAdapters.phantom.connect()
          const address = this.walletAdapters.phantom.publicKey?.toString() as Address
          this.setInjectedProvider(this.walletAdapters.phantom as unknown as Provider, address)
          break;
        }
      }
    } catch (error) {
      SolStoreUtil.setError(error)
    }
  }

  // -- Private -----------------------------------------------------------------
  private async syncConnectors() {
    const w3mConnectors: Connector[] = []

    const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID] as ConnectorType

    w3mConnectors.push({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      type: connectorType,
      imageUrl: 'https://avatars.githubusercontent.com/u/37784886',
      name: this.WalletConnectConnector.name,
      provider: this.WalletConnectConnector.getProvider(),
      info: {
        rdns: ''
      }
    })

    if (window.solana) {
      w3mConnectors.push({
        id: this.walletAdapters.phantom.name,
        type: 'ANNOUNCED',
        imageUrl: this.walletAdapters.phantom.icon,
        name: this.walletAdapters.phantom.name,
        provider: this.walletAdapters.phantom,
        info: {
          rdns: 'app.phantom',
        }
      })
    }
    if (window.solflare) {
      w3mConnectors.push({
        id: this.walletAdapters.solflare.name,
        type: 'ANNOUNCED',
        imageUrl: this.walletAdapters.solflare.icon,
        name: this.walletAdapters.solflare.name,
        provider: this.walletAdapters.solflare,
        info: {
          rdns: 'app.solflare',
        }
      })
    }
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
      const chain = this.chains.find(c => c.chainId === (chainId.includes(':') ? chainId.split(':')[1] : chainId))
      if (chain) {
        const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)
        let balance
        if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          balance = await this.WalletConnectConnector.getBalance(address)
        } else {
          balance = await this.PhantomConnector.getBalance(address)
        }
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

  private async setWalletConnectProvider(provider: UniversalProvider, address: Address) {
    window?.localStorage.setItem(
      SolConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    const namespaces = provider.namespaces as unknown as { solana: { chains: Array<string> } }
    if (namespaces) {
      const chainId = SolStoreUtil.state.currentChain?.chainId

      SolStoreUtil.setIsConnected(true)
      SolStoreUtil.setChainId(chainId)
      SolStoreUtil.setProviderType('walletConnect')
      SolStoreUtil.setProvider(this.WalletConnectConnector as unknown as Provider)
      this.setAddress(address)

      await Promise.all([
        this.syncProfile(),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ])
    }
  }

  private async setInjectedProvider(provider: Provider, address: Address) {
    window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)

    const chainId = SolStoreUtil.state.currentChain?.chainId
    if (address && chainId) {
      SolStoreUtil.setIsConnected(true)
      SolStoreUtil.setChainId(chainId)
      SolStoreUtil.setProviderType('injected')
      SolStoreUtil.setProvider(provider)
      this.setAddress(address)
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
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        SolStoreUtil.setAddress('')
      } else {
        localStorage.removeItem(SolConstantsUtil.WALLET_ID)
        SolStoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        SolStoreUtil.setChainId(chainId)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }
}
