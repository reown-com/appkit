import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import type { PublicKey } from '@solana/web3.js'
import type UniversalProvider from '@walletconnect/universal-provider'

import { Connection } from '@solana/web3.js'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import { SolStoreUtil, SolHelpersUtil, SolConstantsUtil } from '@web3modal/scaffold-utils/solana'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils'
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

import { WalletConnectConnector } from './connectors/WalletConnectConnector'
import { createWalletAdapters, type AdapterKey, syncInjectedWallets } from './connectors/walletAdapters'

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
  private walletAdapters: Record<AdapterKey, BaseWalletAdapter>

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
        if (caipNetwork) {
          try {
            await this.switchNetwork(caipNetwork)
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
            console.log(result)
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
        this.setWalletConnectProvider(address as Address)
      },

      connectExternal: async ({ id }) => {
        const adapter = id === 'Trust' ? 'trustWallet' : id.toLocaleLowerCase() as AdapterKey
        await this.walletAdapters[adapter].connect()
        const address = this.walletAdapters[adapter].publicKey?.toString() as Address
        this.setInjectedProvider(this.walletAdapters[adapter] as unknown as Provider, address, adapter)
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
        const provider = SolStoreUtil.state.provider as Provider;
        const providerType = SolStoreUtil.state.providerType
        localStorage.removeItem(SolConstantsUtil.WALLET_ID)
        SolStoreUtil.reset()
        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider
          await (WalletConnectProvider as unknown as UniversalProvider).disconnect()
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
      defaultChain: SolHelpersUtil.getChainFromCaip(chains, typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : ""),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-solana-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    } as ScaffoldOptions)

    this.chains = chains
    this.syncRequestedNetworks(chains, chainImages)
    SolStoreUtil.setProjectId(options.projectId)
    const chain = SolHelpersUtil.getChainFromCaip(chains, typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : "") as Chain;
    SolStoreUtil.setCurrentChain(chain)
    SolStoreUtil.setChainId(chain?.chainId)
    SolStoreUtil.setCaipChainId(`${chain.name}:${chain.chainId}`)
    this.syncNetwork(chainImages)

    this.walletAdapters = createWalletAdapters()
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
    SolStoreUtil.setConnection(new Connection(chain.rpcUrl ?? 'https://api.devnet.solana.com', 'recent'));
    this.syncConnectors()

    SolStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    SolStoreUtil.subscribeKey('caipChainId', () => {
      this.syncNetwork(chainImages)
    })

    if (typeof window === 'object') {
      setTimeout(() => {
        this.checkActiveProviders()
      }, 500)
      /*
      Debugging for mobile
      setTimeout(() => {
        alert(`
          ${window.phantom?.['solana']?.isPhantom ? 'Phantom is installed' : 'Phantom is not installed'}
          ${window.solflare?.['isSolflare'] ? 'Solflare is installed' : 'Solflare is not installed'}
        `)
      }, 1500) */
    }
  }

  public setAddress(address?: Address | string) {
    SolStoreUtil.setAddress(address ?? '')
  }

  public getAddress() {
    const { address } = SolStoreUtil.state
    return address ? (SolStoreUtil.state.address as Address) : address
  }

  public disconnect() {
    console.log(`disconnect hook triggers`)
  }

  public async checkActiveProviders() {
    const walletId = localStorage.getItem(SolConstantsUtil.WALLET_ID)

    try {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.WalletConnectConnector.connect(true)
        const provider = await this.WalletConnectConnector.getProvider();
        const accounts = await provider.enable();
        this.setWalletConnectProvider(accounts[0] as Address)
      } else {
        const wallet = walletId?.split('_')[1] as AdapterKey
        const adapter = this.walletAdapters[wallet]
        if (window[wallet as keyof Window]) {
          await adapter.connect()
          const address = adapter.publicKey?.toString() as Address
          this.setInjectedProvider(adapter as unknown as Provider, address, wallet)
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

    syncInjectedWallets(w3mConnectors, this.walletAdapters)

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
      this.syncProfile(address),
        await Promise.all([
          this.syncBalance(address),
        ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  private syncProfile(_address: Address | string) {
    this.setProfileName(null)
    this.setProfileImage(null)
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = SolStoreUtil.state.address
    const caipChainId = SolStoreUtil.state.caipChainId
    const isConnected = SolStoreUtil.state.isConnected

    if (this.chains) {
      const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId)
      if (chain) {
        const caipChainId: CaipNetworkId = `${chain.name}:${chain.chainId}`

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        })
        if (isConnected && address) {
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/account/${address}`
            this.setAddressExplorerUrl(url)
          } else {
            this.setAddressExplorerUrl(undefined)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncProfile(address)
            await this.syncBalance(address)
          }
        }
      }
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
          id: `${chain.name}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async switchNetwork(caipNetwork: CaipNetwork) {
    const caipChainId = caipNetwork.id

    const provider = SolStoreUtil.state.provider
    const providerType = SolStoreUtil.state.providerType

    const chain = SolHelpersUtil.getChainFromCaip(this.chains, caipChainId ?? "")

    if (this.chains) {
      if (chain) {
        try {
          SolStoreUtil.setChainId(chain.chainId)
          SolStoreUtil.setCaipChainId(`${chain.name}:${chain.chainId}`)
          SolStoreUtil.setCurrentChain(chain)
          localStorage.setItem(SolConstantsUtil.CAIP_CHAIN_ID, `${chain.name}:${chain.chainId}`)
          switch (providerType) {
            case ConstantsUtil.INJECTED_CONNECTOR_ID:
              if (window.solana?.['connect']) {
                window.solana?.['connect'](chain.chainId)
              }
              this.setAddress(this.walletAdapters.phantom.publicKey?.toString())
              await this.syncAccount()
              break

            case ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID:
              const WalletConnectProvider = provider as unknown as WalletConnectConnector
              const universalProvider = await WalletConnectProvider?.getProvider() as unknown as UniversalProvider
              universalProvider.setDefaultChain('solana:' + chain.chainId, chain.rpcUrl)
              await this.syncAccount()
              break

            default:
              console.log('Unrecognized Wallet')
              break
          }
        } catch (error) {
          console.log("switch network error", error)
        }
      }
    }
  }

  private async setWalletConnectProvider(address: string) {
    const chainId = SolStoreUtil.state.currentChain?.chainId
    const caipChainId = `${SolStoreUtil.state.currentChain?.name}:${SolStoreUtil.state.currentChain?.chainId}`
    const chain = SolHelpersUtil.getChainFromCaip(this.chains, typeof window === 'object' ? localStorage.getItem(SolConstantsUtil.CAIP_CHAIN_ID) : '') as Chain;
    SolStoreUtil.setIsConnected(true)
    SolStoreUtil.setChainId(chainId)
    SolStoreUtil.setCaipChainId(caipChainId)
    SolStoreUtil.setCurrentChain(chain)
    SolStoreUtil.setProviderType('walletConnect')
    SolStoreUtil.setProvider(this.WalletConnectConnector as unknown as Provider)
    this.setAddress(address)

    window?.localStorage.setItem(
      SolConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    await Promise.all([
      this.syncProfile(address),
      this.syncBalance(address),
      this.getApprovedCaipNetworksData()
    ])
  }

  private async setInjectedProvider(provider: Provider, address: Address, adapter: AdapterKey) {
    window?.localStorage.setItem(SolConstantsUtil.WALLET_ID, `${ConstantsUtil.INJECTED_CONNECTOR_ID}_${adapter}`)

    const chainId = SolStoreUtil.state.currentChain?.chainId
    const caipChainId = `${SolStoreUtil.state.currentChain?.name}:${chainId}`

    if (address && chainId) {
      SolStoreUtil.setIsConnected(true)
      SolStoreUtil.setChainId(chainId)
      SolStoreUtil.setCaipChainId(caipChainId)
      SolStoreUtil.setProviderType(`injected_${adapter}`)
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
      provider?.removeListener('connect', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
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

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        SolStoreUtil.setChainId(chainId)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('connect', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }
}
