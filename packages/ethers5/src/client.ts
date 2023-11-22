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
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/utils'

import EthereumProvider from '@walletconnect/ethereum-provider'

import type { Address, Chain, Metadata, ProviderType } from './utils/types.js'
import { ethers, utils } from 'ethers'
import {
  ProviderController,
  type ProviderControllerState
} from './controllers/ProviderController.js'
import {
  addEthereumChain,
  getCaipDefaultChain,
  hexStringToNumber,
  numberToHexString
} from './utils/helpers.js'
import {
  ERROR_CODE_DEFAULT,
  ERROR_CODE_UNRECOGNIZED_CHAIN_ID,
  WALLET_ID
} from './utils/constants.js'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  ethersConfig: ProviderType
  chains?: Chain[]
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

interface Wallet {
  info: Info
  provider: ethers.providers.Web3Provider
}

interface IEIP6963Provider {
  name: string
  provider: ethers.providers.Web3Provider
}

interface ExternalProvider extends EthereumProvider {
  _addresses?: string[]
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private EIP6963Providers: IEIP6963Provider[] = []

  private walletConnectProvider?: EthereumProvider

  private ethersWalletConnectProvider?: ethers.providers.Web3Provider

  private walletConnectProviderInitPromise?: Promise<void>

  private projectId: string

  private chains?: Chain[]

  private metadata?: Metadata

  private options: Web3ModalClientOptions | undefined = undefined

  public constructor(options: Web3ModalClientOptions) {
    const { ethersConfig, chains, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } =
      options

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          await this.switchNetwork(chainId)
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = localStorage.getItem(WALLET_ID)
          if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
            const provider = await this.getWalletConnectProvider()
            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
              )
            }
            const ns = (provider?.provider as EthereumProvider).signer?.session?.namespaces
            console.log({ signer: ns })
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
        const connector = await this.getWalletConnectProvider()
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        const WalletConnectProvider = connector.provider as EthereumProvider

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        await WalletConnectProvider.connect()
        await this.setWalletConnectProvider()
      },

      connectExternal: async ({ id, info, provider }) => {
        if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
          const InjectedProvider = ethersConfig.injected
          if (!InjectedProvider) {
            throw new Error('connectionControllerClient:connectInjected - connector is undefined')
          }
          await InjectedProvider.send('eth_requestAccounts', [])
          this.setInjectedProvider(ethersConfig)
        } else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
          const EIP6963Provider = provider as ethers.providers.Web3Provider
          const EIP6963Info = info as Info

          await EIP6963Provider.send('eth_requestAccounts', [])
          this.setEIP6963Provider(EIP6963Provider, EIP6963Info.name)
        } else if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          const CoinbaseProvider = ethersConfig.coinbase
          if (!CoinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined')
          }
          await CoinbaseProvider.send('eth_requestAccounts', [])

          this.setCoinbaseProvider(ethersConfig)
        }
      },

      checkInstalled(ids) {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        if (ethersConfig.injected) {
          if (!window?.ethereum) {
            return false
          }
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },

      disconnect: async () => {
        const provider = ProviderController.state.provider
        const providerType = ProviderController.state.providerType
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider?.provider as EthereumProvider
          await WalletConnectProvider.disconnect()
        } else if (provider) {
          provider.emit('disconnect')
        }
      },

      parseUnits: (value: string, decimals: number) =>
        ethers.utils.parseUnits(value, decimals).toBigInt(),

      formatUnits: (value: bigint, decimals: number) => ethers.utils.formatUnits(value, decimals),

      sendTransaction: async ({
        address,
        chainId,
        data,
        gasPrice,
        to,
        value,
        gas
      }: SendTransactionArgs) => {
        const provider = ProviderController.state.provider
        const signer = provider?.getSigner()

        const tx = await signer?.sendTransaction({
          chainId,
          data,
          from: address,
          gasPrice,
          value,
          to,
          gasLimit: gas
        })

        await tx?.wait()

        return { hash: tx?.hash }
      }
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-ethers5-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    })

    this.options = options

    this.metadata = ethersConfig.metadata

    this.projectId = w3mOptions.projectId
    this.chains = chains

    this.createProvider()

    ProviderController.subscribeKey('address', () => {
      this.syncAccount()
    })

    ProviderController.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages)
    })

    this.syncRequestedNetworks(chains, chainImages)
    this.syncConnectors(ethersConfig)

    if (ethersConfig.EIP6963) {
      if (typeof window !== 'undefined') {
        this.listenConnectors(ethersConfig.EIP6963)
        this.checkActive6963Provider()
      }
    }

    if (ethersConfig.injected) {
      this.checkActiveInjectedProvider(ethersConfig)
    }
    if (ethersConfig.coinbase) {
      this.checkActiveCoinbaseProvider(ethersConfig)
    }
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  public getAddress() {
    return ProviderController.state.address
  }

  public getChainId() {
    return ProviderController.state.chainId
  }

  public getIsConnected() {
    return ProviderController.state.isConnected
  }

  public getWalletProvider() {
    return ProviderController.state.provider
  }

  public getWalletProviderType() {
    return ProviderController.state.providerType
  }

  public getSigner() {
    return ProviderController.state.provider?.getSigner()
  }

  public subscribeProvider(callback: (newState: ProviderControllerState) => void) {
    return ProviderController.subscribe(callback)
  }

  public async disconnect() {
    const { provider, providerType } = ProviderController.state
    localStorage.removeItem(WALLET_ID)
    ProviderController.reset()

    if (providerType === 'injected' || providerType === 'eip6963') {
      provider?.emit('disconnect')
    } else {
      const ethersProvider = provider?.provider as EthereumProvider
      await ethersProvider.disconnect()
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
            map[chain.chainId] = chain.rpcUrl

            return map
          }, {})
        : ({} as Record<number, string>),
      optionalChains: this.chains ? [0, ...this.chains.map(chain => chain.chainId)] : [0],
      metadata: {
        name: this.metadata ? this.metadata.name : '',
        description: this.metadata ? this.metadata.description : '',
        url: this.metadata ? this.metadata.url : '',
        icons: this.metadata ? this.metadata.icons : ['']
      }
    }
    this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)
    this.ethersWalletConnectProvider = new ethers.providers.Web3Provider(
      this.walletConnectProvider,
      'any'
    )
    await this.checkActiveWalletConnectProvider()
  }

  private async getWalletConnectProvider() {
    if (!this.ethersWalletConnectProvider) {
      await this.createProvider()
    }

    return this.ethersWalletConnectProvider
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

  private async checkActiveWalletConnectProvider() {
    const provider = await this.getWalletConnectProvider()
    const WalletConnectProvider = provider?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }
  }

  private checkActiveInjectedProvider(config: ProviderType) {
    const InjectedProvider = config.injected?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (InjectedProvider) {
      if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
        this.watchInjected(config)
      }
    }
  }

  private checkActiveCoinbaseProvider(config: ProviderType) {
    const CoinbaseProvider = config.coinbase?.provider as ExternalProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
          this.watchCoinbase(config)
        } else {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        }
      }
    }
  }

  private checkActive6963Provider() {
    const currentActiveWallet = window?.localStorage.getItem(WALLET_ID)
    if (currentActiveWallet) {
      const currentProvider = this.EIP6963Providers.find(
        provider => provider.name === currentActiveWallet
      )
      if (currentProvider) {
        this.setEIP6963Provider(currentProvider.provider, currentProvider.name)
      }
    }
  }

  private async setWalletConnectProvider() {
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)
    const provider = await this.getWalletConnectProvider()
    const WalletConnectProvider = provider?.provider as EthereumProvider
    if (WalletConnectProvider) {
      ProviderController.setChainId(WalletConnectProvider.chainId)
      ProviderController.setProviderType('walletConnect')
      ProviderController.setProvider(provider)
      ProviderController.setIsConnected(true)
      ProviderController.setAddress(WalletConnectProvider.accounts[0] as Address)
      this.watchWalletConnect()
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)
    const InjectedProvider = config.injected

    if (InjectedProvider) {
      const signer = InjectedProvider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('injected')
        ProviderController.setProvider(config.injected)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
        this.watchCoinbase(config)
      }
    }
  }

  private async setEIP6963Provider(provider: ethers.providers.Web3Provider, name: string) {
    window?.localStorage.setItem(WALLET_ID, name)

    if (provider) {
      const signer = provider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('eip6963')
        ProviderController.setProvider(provider)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
        this.watchEIP6963(provider)
      }
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID)
    const CoinbaseProvider = config.coinbase

    if (CoinbaseProvider) {
      const signer = CoinbaseProvider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('coinbaseWallet')
        ProviderController.setProvider(config.coinbase)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
        this.watchCoinbase(config)
      }
    }
  }

  private async watchWalletConnect() {
    const provider = await this.getWalletConnectProvider()
    const WalletConnectProvider = provider?.provider as EthereumProvider

    function disconnectHandler() {
      localStorage.removeItem(WALLET_ID)
      ProviderController.reset()

      WalletConnectProvider.removeListener('disconnect', disconnectHandler)
      WalletConnectProvider.removeListener('accountsChanged', accountsChangedHandler)
      WalletConnectProvider.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = hexStringToNumber(chainId)
        ProviderController.setChainId(chain)
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

  private watchInjected(config: ProviderType) {
    const provider = config.injected
    const InjectedProvider = provider?.provider as EthereumProvider

    function disconnectHandler() {
      localStorage.removeItem(WALLET_ID)
      ProviderController.reset()

      InjectedProvider.removeListener('disconnect', disconnectHandler)
      InjectedProvider.removeListener('accountsChanged', accountsChangedHandler)
      InjectedProvider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      } else {
        ProviderController.setAddress(accounts[0] as Address)
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = typeof chainId === 'string' ? hexStringToNumber(chainId) : Number(chainId)
        ProviderController.setChainId(chain)
      }
    }

    if (InjectedProvider && provider) {
      provider.on('disconnect', disconnectHandler)
      InjectedProvider.on('disconnect', disconnectHandler)
      InjectedProvider.on('accountsChanged', accountsChangedHandler)
      InjectedProvider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchEIP6963(provider: ethers.providers.Web3Provider) {
    const EIP6963Provider = provider.provider as ExternalProvider

    function disconnectHandler() {
      localStorage.removeItem(WALLET_ID)
      ProviderController.reset()

      EIP6963Provider.removeListener('disconnect', disconnectHandler)
      EIP6963Provider.removeListener('accountsChanged', accountsChangedHandler)
      EIP6963Provider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      } else {
        ProviderController.setAddress(accounts[0] as Address)
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = typeof chainId === 'string' ? hexStringToNumber(chainId) : Number(chainId)
        ProviderController.setChainId(chain)
      }
    }

    if (EIP6963Provider) {
      provider.on('disconnect', disconnectHandler)
      EIP6963Provider.on('disconnect', disconnectHandler)
      EIP6963Provider.on('accountsChanged', accountsChangedHandler)
      EIP6963Provider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchCoinbase(config: ProviderType) {
    const provider = config.coinbase
    const CoinbaseProvider = provider?.provider as ExternalProvider
    const walletId = localStorage.getItem(WALLET_ID)

    function disconnectHandler() {
      localStorage.removeItem(WALLET_ID)
      ProviderController.reset()

      CoinbaseProvider.removeListener('disconnect', disconnectHandler)
      CoinbaseProvider.removeListener('accountsChanged', accountsChangedHandler)
      CoinbaseProvider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      } else {
        ProviderController.setAddress(accounts[0] as Address)
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId && walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        const chain = Number(chainId)
        ProviderController.setChainId(chain)
      }
    }

    if (CoinbaseProvider && provider) {
      provider.on('disconnect', disconnectHandler)
      CoinbaseProvider.on('disconnect', disconnectHandler)
      CoinbaseProvider.on('accountsChanged', accountsChangedHandler)
      CoinbaseProvider.on('chainChanged', chainChangedHandler)
    }
  }

  private async syncAccount() {
    const address = ProviderController.state.address
    const chainId = ProviderController.state.chainId
    const isConnected = ProviderController.state.isConnected

    this.resetAccount()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

      this.setIsConnected(isConnected)

      this.setCaipAddress(caipAddress)
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
    const address = ProviderController.state.address
    const chainId = ProviderController.state.chainId
    const isConnected = ProviderController.state.isConnected
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
            const url = `${chain.explorerUrl}/address/${address}`
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

  private async syncProfile(address: Address) {
    const ensProvider = new ethers.providers.InfuraProvider('mainnet')
    const name = await ensProvider.lookupAddress(address)
    const avatar = await ensProvider.getAvatar(address)
    if (name) {
      this.setProfileName(name)
    }
    if (avatar) {
      this.setProfileImage(avatar)
    }
  }

  private async syncBalance(address: Address) {
    const chainId = ProviderController.state.chainId
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const JsonRpcProvider = new ethers.providers.JsonRpcProvider(chain.rpcUrl, {
          chainId,
          name: chain.name
        })
        if (JsonRpcProvider) {
          const balance = await JsonRpcProvider.getBalance(address)
          const formattedBalance = utils.formatEther(balance)
          this.setBalance(formattedBalance, chain.currency)
        }
      }
    }
  }

  private async switchNetwork(chainId: number) {
    const provider = ProviderController.state.provider
    const providerType = ProviderController.state.providerType
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
        const WalletConnectProvider = provider?.provider as EthereumProvider

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: numberToHexString(chain.chainId) }]
            })

            ProviderController.setChainId(chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await addEthereumChain(
                WalletConnectProvider,
                chain,
                ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
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
            await InjectedProvider.send('wallet_switchEthereumChain', [
              { chainId: numberToHexString(chain.chainId) }
            ])
            ProviderController.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await addEthereumChain(InjectedProvider, chain, ConstantsUtil.INJECTED_CONNECTOR_ID)
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && chain) {
        const EIP6963Provider = provider

        if (EIP6963Provider) {
          try {
            await EIP6963Provider.send('wallet_switchEthereumChain', [
              { chainId: numberToHexString(chain.chainId) }
            ])
            ProviderController.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await addEthereumChain(EIP6963Provider, chain, ConstantsUtil.INJECTED_CONNECTOR_ID)
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.COINBASE_CONNECTOR_ID && chain) {
        const CoinbaseProvider = provider
        if (CoinbaseProvider) {
          try {
            await CoinbaseProvider.send('wallet_switchEthereumChain', [
              { chainId: numberToHexString(chain.chainId) }
            ])
            ProviderController.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await addEthereumChain(CoinbaseProvider, chain, ConstantsUtil.INJECTED_CONNECTOR_ID)
            }
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

  private eip6963EventHandler(event: CustomEventInit<Wallet>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const connectors = this.getConnectors()
      const existingConnector = connectors.find(c => c.name === info.name)
      if (!existingConnector) {
        const eip6963Provider = provider as unknown as ExternalProvider
        const web3provider = new ethers.providers.Web3Provider(eip6963Provider, 'any')
        const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]
        if (type) {
          this.addConnector({
            id: ConstantsUtil.EIP6963_CONNECTOR_ID,
            type,
            imageUrl:
              info.icon ?? this.options?.connectorImages?.[ConstantsUtil.EIP6963_CONNECTOR_ID],
            name: info.name,
            provider: web3provider,
            info
          })

          const eip6963ProviderObj = {
            name: info.name,
            provider: web3provider
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
