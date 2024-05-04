/* eslint-disable max-depth */
import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  Connector,
  LibraryOptions,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs,
  Token
} from '@web3modal/scaffold'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import EthereumProvider from '@walletconnect/ethereum-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import { Web3Eth } from 'web3-eth'
import { ENS } from 'web3-eth-ens'
import { type Eip1193Compatible } from 'web3-types'
import {
  toChecksumAddress as getOriginalAddress,
  fromWei,
  toWei,
  ethUnitMap,
  type EtherUnits
} from 'web3-utils'
import type { Address } from './utils/types.js'
import {
  type Metadata,
  type Provider,
  type ProviderType,
  type Chain,
  type SimpleChain,
  type CombinedProvider,
  ensureChainType
} from './scaffold-utils/Web3TypesUtil.js'
import type { Web3StoreUtilState } from './scaffold-utils/Web3StoreUtil.js'
import { Web3ConstantsUtil } from './scaffold-utils/Web3ConstantsUtil.js'
import { Web3HelpersUtil } from './scaffold-utils/Web3HelpersUtil.js'
import { Web3StoreUtil } from './scaffold-utils/Web3StoreUtil.js'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import {
  W3mFrameProvider,
  W3mFrameHelpers,
  W3mFrameRpcConstants,
  W3mFrameConstants
} from '@web3modal/wallet'
import { NetworkUtil } from '@web3modal/common'
import type { W3mFrameTypes } from '@web3modal/wallet'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  web3Config: ProviderType
  chains: Chain[] | SimpleChain[]
  siweConfig?: Web3ModalSIWEClient
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// @ts-expect-error: Overriden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined
}

interface Info {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface EIP6963ProviderDetail {
  info: Info
  provider: Provider
}

interface ExternalProvider extends EthereumProvider {
  _addresses?: string[]
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private EIP6963Providers: EIP6963ProviderDetail[] = []

  private walletConnectProvider?: EthereumProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private projectId: string

  private chains: Chain[]

  private metadata?: Metadata

  private options: Web3ModalClientOptions | undefined = undefined

  private emailProvider?: W3mFrameProvider

  public constructor(options: Web3ModalClientOptions) {
    const {
      web3Config,
      siweConfig,
      chains,
      defaultChain,
      tokens,
      chainImages,
      _sdkVersion,
      ...w3mOptions
    } = options
    if (!web3Config) {
      throw new Error('web3modal:constructor - web3Config is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          try {
            Web3StoreUtil.setError(undefined)
            await this.switchNetwork(chainId)
          } catch (error) {
            Web3StoreUtil.setError(error)
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = localStorage.getItem(Web3ConstantsUtil.WALLET_ID)
          if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
            const provider = await this.getWalletConnectProvider()
            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
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

      //  @ts-expect-error TODO expected types in arguments are incomplete
      connectExternal: async ({
        id,
        info,
        provider
      }: {
        id: string
        info: Info
        provider: Provider
      }) => {
        if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
          const InjectedProvider = web3Config.injected
          if (!InjectedProvider) {
            throw new Error('connectionControllerClient:connectInjected - provider is undefined')
          }
          try {
            Web3StoreUtil.setError(undefined)
            await InjectedProvider.request({ method: 'eth_requestAccounts' })
            this.setInjectedProvider(web3Config)
          } catch (error) {
            Web3StoreUtil.setError(error)
          }
        } else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
          try {
            Web3StoreUtil.setError(undefined)
            await provider.request({ method: 'eth_requestAccounts' })
            this.setEIP6963Provider(provider, info.name)
          } catch (error) {
            Web3StoreUtil.setError(error)
          }
        } else if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          const CoinbaseProvider = web3Config.coinbase
          if (!CoinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined')
          }

          try {
            Web3StoreUtil.setError(undefined)
            await CoinbaseProvider.request({ method: 'eth_requestAccounts' })
            this.setCoinbaseProvider(web3Config)
          } catch (error) {
            Web3StoreUtil.setError(error)
          }
        } else if (id === ConstantsUtil.EMAIL_CONNECTOR_ID) {
          this.setEmailProvider()
        }
      },

      checkInstalled(ids) {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        if (web3Config.injected) {
          if (!window?.ethereum) {
            return false
          }
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },

      disconnect: async () => {
        const provider = Web3StoreUtil.state.provider
        const providerType = Web3StoreUtil.state.providerType

        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider
          await (WalletConnectProvider as unknown as EthereumProvider).disconnect()
          // eslint-disable-next-line no-negated-condition
        } else if (providerType === ConstantsUtil.EMAIL_CONNECTOR_ID) {
          await this.emailProvider?.disconnect()
        } else {
          provider?.emit('disconnect')
        }
        localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
        Web3StoreUtil.reset()
      },

      signMessage: async (message: string) => {
        const provider = Web3StoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, this.getAddress()]
        })

        return signature as `0x${string}`
      },

      parseUnits: (value: string, decimals: number) =>
        BigInt(
          toWei(
            value,
            (Object.keys(ethUnitMap).find(
              u => ethUnitMap[u as EtherUnits].toString().length === decimals
            ) ?? 'ether') as EtherUnits
          )
        ),

      formatUnits: (value: bigint, decimals: number) =>
        fromWei(
          value,
          (Object.keys(ethUnitMap).find(
            u => ethUnitMap[u as EtherUnits].toString().length === decimals
          ) ?? 'ether') as EtherUnits
        ),

      async estimateGas(data) {
        const chainId = Web3StoreUtil.state.chainId
        const provider = Web3StoreUtil.state.provider
        const address = Web3StoreUtil.state.address

        if (!provider) {
          throw new Error('connectionControllerClient:sendTransaction - provider is undefined')
        }

        if (!address) {
          throw new Error('connectionControllerClient:sendTransaction - address is undefined')
        }

        const txParams = {
          from: data.address,
          to: data.to,
          data: data.data,
          type: 0
        }

        const web3Eth = new Web3Eth({
          provider,
          config: { defaultNetworkId: chainId, defaultAccount: address }
        })
        const gas = await web3Eth.estimateGas(txParams)

        return gas
      },

      sendTransaction: async (data: SendTransactionArgs) => {
        const chainId = Web3StoreUtil.state.chainId
        const provider = Web3StoreUtil.state.provider
        const address = Web3StoreUtil.state.address

        if (!provider) {
          throw new Error('connectionControllerClient:sendTransaction - provider is undefined')
        }

        if (!address) {
          throw new Error('connectionControllerClient:sendTransaction - address is undefined')
        }

        const txParams = {
          to: data.to,
          value: data.value,
          gasLimit: data.gas,
          gasPrice: data.gasPrice,
          data: data.data,
          type: 0
        }

        const web3Eth = new Web3Eth({
          provider,
          config: { defaultNetworkId: chainId, defaultAccount: address }
        })

        const txResponse = await web3Eth.sendTransaction(txParams)
        const transactionHash = txResponse.transactionHash

        return (transactionHash as `0x${string}`) || null
      }
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      siweControllerClient: siweConfig,
      defaultChain: Web3HelpersUtil.getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-web3-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    })

    this.options = options

    this.metadata = web3Config.metadata

    this.projectId = w3mOptions.projectId
    this.chains = ensureChainType(chains)

    this.createProvider()

    Web3StoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    Web3StoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages)
    })

    this.syncRequestedNetworks(chains, chainImages)
    this.syncConnectors(web3Config)

    if (web3Config.EIP6963) {
      if (typeof window !== 'undefined') {
        this.listenConnectors(web3Config.EIP6963)
        this.checkActive6963Provider()
      }
    }

    if (web3Config.email) {
      this.syncEmailConnector(w3mOptions.projectId)
    }

    if (web3Config.injected) {
      this.checkActiveInjectedProvider(web3Config)
    }
    if (web3Config.coinbase) {
      this.checkActiveCoinbaseProvider(web3Config)
    }
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  public setAddress(address?: string) {
    const originalAddress = address ? (getOriginalAddress(address) as Address) : undefined
    Web3StoreUtil.setAddress(originalAddress)
  }

  public getAddress() {
    const { address } = Web3StoreUtil.state

    return address ? getOriginalAddress(address) : undefined
  }

  public getError() {
    return Web3StoreUtil.state.error
  }

  public getChainId() {
    return Web3StoreUtil.state.chainId
  }

  public getIsConnected() {
    return Web3StoreUtil.state.isConnected
  }

  public getWalletProvider() {
    return Web3StoreUtil.state.provider as Eip1193Compatible | undefined
  }

  public getWalletProviderType() {
    return Web3StoreUtil.state.providerType
  }

  public subscribeProvider(callback: (newState: Web3StoreUtilState) => void) {
    return Web3StoreUtil.subscribe(callback)
  }

  public async disconnect() {
    const { provider, providerType } = Web3StoreUtil.state

    localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
    Web3StoreUtil.reset()

    if (providerType === 'injected' || providerType === 'eip6963') {
      provider?.emit('disconnect')
    } else {
      const walletConnectProvider = provider as unknown as EthereumProvider
      if (walletConnectProvider) {
        try {
          Web3StoreUtil.setError(undefined)
          await walletConnectProvider.disconnect()
        } catch (error) {
          Web3StoreUtil.setError(error)
        }
      }
    }
  }

  // -- Private -----------------------------------------------------------------
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
            map[chain.chainId] =
              chain.rpcUrls && chain.rpcUrls.length > 0 && chain.rpcUrls[0] ? chain.rpcUrls[0] : ''

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

  private async getWalletConnectProvider() {
    if (!this.walletConnectProvider) {
      try {
        Web3StoreUtil.setError(undefined)
        await this.createProvider()
      } catch (error) {
        Web3StoreUtil.setError(error)
      }
    }

    return this.walletConnectProvider
  }

  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
          name: (chain as Chain).chainName || (chain as SimpleChain).name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(Web3ConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }
  }

  private checkActiveInjectedProvider(config: ProviderType) {
    const InjectedProvider = config.injected
    const walletId = localStorage.getItem(Web3ConstantsUtil.WALLET_ID)

    if (InjectedProvider) {
      if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
        this.watchInjected(config)
      }
    }
  }

  private checkActiveCoinbaseProvider(config: ProviderType) {
    const CoinbaseProvider = config.coinbase as unknown as ExternalProvider
    const walletId = localStorage.getItem(Web3ConstantsUtil.WALLET_ID)

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
          this.watchCoinbase(config)
        } else {
          localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
          Web3StoreUtil.reset()
        }
      }
    }
  }

  private checkActive6963Provider() {
    const currentActiveWallet = window?.localStorage.getItem(Web3ConstantsUtil.WALLET_ID)
    if (currentActiveWallet) {
      const currentProvider = this.EIP6963Providers.find(
        provider => provider.info.name === currentActiveWallet
      )
      if (currentProvider) {
        this.setEIP6963Provider(currentProvider.provider, currentProvider.info.name)
      }
    }
  }

  private async setWalletConnectProvider() {
    window?.localStorage.setItem(
      Web3ConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    const WalletConnectProvider = await this.getWalletConnectProvider()
    if (WalletConnectProvider) {
      Web3StoreUtil.setChainId(WalletConnectProvider.chainId)
      Web3StoreUtil.setProviderType('walletConnect')
      Web3StoreUtil.setProvider(WalletConnectProvider as unknown as CombinedProvider)
      Web3StoreUtil.setIsConnected(true)
      this.setAddress(WalletConnectProvider.accounts?.[0])
      this.watchWalletConnect()
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    window?.localStorage.setItem(Web3ConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)
    const InjectedProvider = config.injected

    if (InjectedProvider) {
      const { address, chainId } = await Web3HelpersUtil.getUserInfo(InjectedProvider)
      if (address && chainId) {
        Web3StoreUtil.setChainId(chainId)
        Web3StoreUtil.setProviderType('injected')
        Web3StoreUtil.setProvider(config.injected)
        Web3StoreUtil.setIsConnected(true)
        this.setAddress(address)
        this.watchCoinbase(config)
      }
    }
  }

  private async setEIP6963Provider(provider: Provider, name: string) {
    window?.localStorage.setItem(Web3ConstantsUtil.WALLET_ID, name)

    if (provider) {
      const { address, chainId } = await Web3HelpersUtil.getUserInfo(provider)
      if (address && chainId) {
        Web3StoreUtil.setChainId(chainId)
        Web3StoreUtil.setProviderType('eip6963')
        Web3StoreUtil.setProvider(provider)
        Web3StoreUtil.setIsConnected(true)
        this.setAddress(address)
        this.watchEIP6963(provider)
      }
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    window?.localStorage.setItem(Web3ConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID)
    const CoinbaseProvider = config.coinbase

    if (CoinbaseProvider) {
      const { address, chainId } = await Web3HelpersUtil.getUserInfo(CoinbaseProvider)
      if (address && chainId) {
        Web3StoreUtil.setChainId(chainId)
        Web3StoreUtil.setProviderType('coinbaseWallet')
        Web3StoreUtil.setProvider(config.coinbase)
        Web3StoreUtil.setIsConnected(true)
        this.setAddress(address)
        this.watchCoinbase(config)
      }
    }
  }

  private async setEmailProvider() {
    window?.localStorage.setItem(Web3ConstantsUtil.WALLET_ID, ConstantsUtil.EMAIL_CONNECTOR_ID)
    if (this.emailProvider) {
      const { address, chainId, smartAccountDeployed, preferredAccountType } =
        await this.emailProvider.connect({ chainId: this.getChainId() })

      const { smartAccountEnabledNetworks } =
        await this.emailProvider.getSmartAccountEnabledNetworks()

      this.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks)
      if (address && chainId) {
        Web3StoreUtil.setChainId(chainId)
        Web3StoreUtil.setProviderType(ConstantsUtil.EMAIL_CONNECTOR_ID as 'w3mEmail')
        Web3StoreUtil.setProvider(this.emailProvider as unknown as CombinedProvider)
        Web3StoreUtil.setIsConnected(true)
        Web3StoreUtil.setAddress(address as Address)
        Web3StoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
        this.setSmartAccountDeployed(Boolean(smartAccountDeployed))

        this.watchEmail()
        this.watchModal()
      }
      super.setLoading(false)
    }
  }

  private async watchWalletConnect() {
    const provider = await this.getWalletConnectProvider()

    function disconnectHandler() {
      localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
      Web3StoreUtil.reset()

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = Web3HelpersUtil.hexStringToNumber(chainId)
        Web3StoreUtil.setChainId(chain)
      }
    }

    const accountsChangedHandler = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await this.setWalletConnectProvider()
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchInjected(config: ProviderType) {
    const provider = config.injected

    function disconnectHandler() {
      localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
      Web3StoreUtil.reset()

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        Web3StoreUtil.setAddress(getOriginalAddress(currentAccount) as Address)
      } else {
        localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
        Web3StoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain =
          typeof chainId === 'string' ? Web3HelpersUtil.hexStringToNumber(chainId) : Number(chainId)
        Web3StoreUtil.setChainId(chain)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchEIP6963(provider: Provider) {
    function disconnectHandler() {
      localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
      Web3StoreUtil.reset()

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        Web3StoreUtil.setAddress(getOriginalAddress(currentAccount) as Address)
      } else {
        localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
        Web3StoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain =
          typeof chainId === 'string' ? Web3HelpersUtil.hexStringToNumber(chainId) : Number(chainId)
        Web3StoreUtil.setChainId(chain)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchCoinbase(config: ProviderType) {
    const provider = config.coinbase
    const walletId = localStorage.getItem(Web3ConstantsUtil.WALLET_ID)

    function disconnectHandler() {
      localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
      Web3StoreUtil.reset()

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        Web3StoreUtil.setAddress(getOriginalAddress(currentAccount) as Address)
      } else {
        localStorage.removeItem(Web3ConstantsUtil.WALLET_ID)
        Web3StoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId && walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        const chain = Number(chainId)
        Web3StoreUtil.setChainId(chain)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchEmail() {
    if (this.emailProvider) {
      this.emailProvider.onRpcRequest(request => {
        if (W3mFrameHelpers.checkIfRequestExists(request)) {
          if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
            if (super.isOpen()) {
              if (!super.isTransactionStackEmpty()) {
                super.redirect('ApproveTransaction')
              }
            } else {
              super.open({ view: 'ApproveTransaction' })
            }
          }
        } else {
          super.open()
          const method = W3mFrameHelpers.getRequestMethod(request)
          // eslint-disable-next-line no-console
          console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, { method })
          setTimeout(() => {
            this.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
          }, 300)
        }
      })
      this.emailProvider.onRpcResponse(response => {
        const responseType = W3mFrameHelpers.getResponseType(response)

        switch (responseType) {
          case W3mFrameConstants.RPC_RESPONSE_TYPE_ERROR: {
            const isModalOpen = super.isOpen()

            if (isModalOpen) {
              if (super.isTransactionStackEmpty()) {
                super.close()
              } else {
                super.popTransactionStack(true)
              }
            }
            break
          }
          case W3mFrameConstants.RPC_RESPONSE_TYPE_TX: {
            if (super.isTransactionStackEmpty()) {
              super.close()
            } else {
              super.popTransactionStack()
            }
            break
          }
          default:
            break
        }
      })
      this.emailProvider.onNotConnected(() => {
        this.setIsConnected(false)
        super.setLoading(false)
      })
      this.emailProvider.onIsConnected(({ preferredAccountType }) => {
        this.setIsConnected(true)
        super.setLoading(false)
        Web3StoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
      })

      this.emailProvider.onSetPreferredAccount(({ address, type }) => {
        if (!address) {
          return
        }
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id)
        Web3StoreUtil.setAddress(address as Address)
        Web3StoreUtil.setChainId(chainId)
        Web3StoreUtil.setIsConnected(true)
        Web3StoreUtil.setPreferredAccountType(type as W3mFrameTypes.AccountType)
        this.syncAccount()
      })
    }
  }

  private watchModal() {
    if (this.emailProvider) {
      this.subscribeState(val => {
        if (!val.open) {
          this.emailProvider?.rejectRpcRequest()
        }
      })
    }
  }

  private async syncAccount() {
    const address = Web3StoreUtil.state.address
    const chainId = Web3StoreUtil.state.chainId
    const isConnected = Web3StoreUtil.state.isConnected
    const preferredAccountType = Web3StoreUtil.state.preferredAccountType

    this.resetAccount()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

      this.setIsConnected(isConnected)
      this.setPreferredAccountType(preferredAccountType)
      this.setCaipAddress(caipAddress)
      this.syncConnectedWalletInfo()
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = Web3StoreUtil.state.address
    const chainId = Web3StoreUtil.state.chainId
    const isConnected = Web3StoreUtil.state.isConnected
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chain.chainId}`

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.nativeCurrency.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        })
        if (isConnected && address) {
          const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`
          this.setCaipAddress(caipAddress)
          if (chain.blockExplorerUrls && chain.blockExplorerUrls.length > 0) {
            const url = `${chain.blockExplorerUrls[0]}/address/${address}`
            this.setAddressExplorerUrl(url)
          } else {
            this.setAddressExplorerUrl(undefined)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncProfile(address)
            await this.syncBalance(address)
          }
        }
      } else if (isConnected) {
        this.setCaipNetwork({
          id: `${ConstantsUtil.EIP155}:${chainId}`
        })
      }
    }
  }

  private async syncProfile(address: Address) {
    const chainId = Web3StoreUtil.state.chainId

    try {
      const { name, avatar } = await this.fetchIdentity({
        address
      })
      this.setProfileName(name)
      this.setProfileImage(avatar)
    } catch {
      if (chainId === 1) {
        // @TODO: refactor to possibly use Infura
        const ens = new ENS(undefined, 'https://eth.llamarpc.com')

        try {
          const name = await ens.getName(address)
          if (name) {
            this.setProfileName(name)
          } else {
            this.setProfileName(null)
          }
        } catch {
          this.setProfileName(null)
        }

        try {
          const avatar = await ens.getText(address, 'avatar')
          if (avatar) {
            this.setProfileImage(avatar)
          } else {
            this.setProfileImage(null)
          }
        } catch {
          this.setProfileImage(null)
        }
      }
    }
  }

  private async syncBalance(address: Address) {
    const chainId = Web3StoreUtil.state.chainId
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const web3Eth = new Web3Eth({
          provider:
            chain.rpcUrls && chain.rpcUrls.length > 0 && chain.rpcUrls[0] ? chain.rpcUrls[0] : '',
          config: {
            defaultNetworkId: chainId,
            defaultChain: chain.chainName
          }
        })
        try {
          const balance = await web3Eth.getBalance(address)
          const formattedBalance = fromWei(balance, 'ether')

          this.setBalance(formattedBalance, chain.nativeCurrency.name)
        } catch (error) {
          // Do nothing if sync balance fails
        }
      }
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = window?.localStorage.getItem(Web3ConstantsUtil.WALLET_ID)
    const providerType = Web3StoreUtil.state.providerType

    if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      if (currentActiveWallet) {
        const currentProvider = this.EIP6963Providers.find(
          provider => provider.info.name === currentActiveWallet
        )

        if (currentProvider) {
          this.setConnectedWalletInfo({
            ...currentProvider.info
          })
        }
      }
    } else if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
      const provider = Web3StoreUtil.state.provider as unknown as EthereumProvider

      if (provider.session) {
        this.setConnectedWalletInfo({
          ...provider.session.peer.metadata,
          name: provider.session.peer.metadata.name,
          icon: provider.session.peer.metadata.icons?.[0]
        })
      }
    } else if (currentActiveWallet) {
      this.setConnectedWalletInfo({
        name: currentActiveWallet
      })
    }
  }

  public async switchNetwork(chainId: number) {
    const provider = Web3StoreUtil.state.provider
    const providerType = Web3StoreUtil.state.providerType
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: Web3HelpersUtil.numberToHexString(chain.chainId) }]
            })

            Web3StoreUtil.setChainId(chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === Web3ConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await Web3HelpersUtil.addEthereumChain(
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
              params: [{ chainId: Web3HelpersUtil.numberToHexString(chain.chainId) }]
            })
            Web3StoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === Web3ConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await Web3HelpersUtil.addEthereumChain(InjectedProvider, chain)
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
              params: [{ chainId: Web3HelpersUtil.numberToHexString(chain.chainId) }]
            })
            Web3StoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === Web3ConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await Web3HelpersUtil.addEthereumChain(EIP6963Provider, chain)
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
              params: [{ chainId: Web3HelpersUtil.numberToHexString(chain.chainId) }]
            })
            Web3StoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === Web3ConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                Web3ConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await Web3HelpersUtil.addEthereumChain(CoinbaseProvider, chain)
            }
          }
        }
      } else if (providerType === ConstantsUtil.EMAIL_CONNECTOR_ID) {
        if (this.emailProvider && chain?.chainId) {
          try {
            await this.emailProvider.switchNetwork(chain?.chainId)
            Web3StoreUtil.setChainId(chain.chainId)

            const { address, preferredAccountType } = await this.emailProvider.connect({
              chainId: chain?.chainId
            })

            Web3StoreUtil.setAddress(address as Address)
            Web3StoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
            await this.syncAccount()
          } catch {
            throw new Error('Switching chain failed')
          }
        }
      }
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = []

    const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]
    if (connectorType) {
      w3mConnectors.push({
        id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        type: connectorType
      })
    }

    if (config.injected) {
      const injectedConnectorType =
        PresetsUtil.ConnectorTypesMap[ConstantsUtil.INJECTED_CONNECTOR_ID]
      if (injectedConnectorType) {
        w3mConnectors.push({
          id: ConstantsUtil.INJECTED_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          imageUrl: this.options?.connectorImages?.[ConstantsUtil.INJECTED_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.INJECTED_CONNECTOR_ID],
          type: injectedConnectorType
        })
      }
    }

    if (config.coinbase) {
      w3mConnectors.push({
        id: ConstantsUtil.COINBASE_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
        type: 'EXTERNAL'
      })
    }

    this.setConnectors(w3mConnectors)
  }

  private async syncEmailConnector(projectId: string) {
    if (typeof window !== 'undefined') {
      this.emailProvider = new W3mFrameProvider(projectId)

      this.addConnector({
        id: ConstantsUtil.EMAIL_CONNECTOR_ID,
        type: 'EMAIL',
        name: 'Email',
        provider: this.emailProvider
      })

      super.setLoading(true)
      const isLoginEmailUsed = this.emailProvider.getLoginEmailUsed()
      super.setLoading(isLoginEmailUsed)
      const { isConnected } = await this.emailProvider.isConnected()
      if (isConnected) {
        await this.setEmailProvider()
      } else {
        super.setLoading(false)
      }
    }
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const connectors = this.getConnectors()
      const existingConnector = connectors.find(c => c.name === info.name)

      if (!existingConnector) {
        const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]
        if (type) {
          this.addConnector({
            id: ConstantsUtil.EIP6963_CONNECTOR_ID,
            type,
            imageUrl:
              info.icon ?? this.options?.connectorImages?.[ConstantsUtil.EIP6963_CONNECTOR_ID],
            name: info.name,
            provider,
            info
          })

          const eip6963ProviderObj = {
            provider,
            info
          }

          this.EIP6963Providers.push(eip6963ProviderObj)
        }
      }
    }
  }

  private listenConnectors(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      const handler = this.eip6963EventHandler.bind(this)
      window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler)
      window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT))
    }
  }
}
