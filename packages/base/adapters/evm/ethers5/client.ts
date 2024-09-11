/* eslint-disable max-depth */
import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ChainAdapter,
  ConnectionControllerClient,
  Connector,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs,
  Token
} from '@web3modal/core'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
import { getChainsFromAccounts } from '@walletconnect/utils'
import type {
  Address,
  Metadata,
  ProviderType,
  Chain,
  Provider,
  EthersStoreUtilState
} from '@web3modal/scaffold-utils/ethers'
import { ethers, utils } from 'ethers5'
import {
  EthersConstantsUtil,
  EthersHelpersUtil,
  EthersStoreUtil
} from '@web3modal/scaffold-utils/ethers'
import { W3mFrameProvider, W3mFrameHelpers, W3mFrameRpcConstants } from '@web3modal/wallet'
import type { W3mFrameTypes } from '@web3modal/wallet'
import type { CombinedProvider } from '@web3modal/scaffold-utils/ethers'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import { NetworkUtil } from '@web3modal/common'
import type { Chain as AvailableChain } from '@web3modal/common'
import type { AppKit } from '../../../src/client.js'
import type { AppKitOptions } from '../../../utils/TypesUtil.js'
import type { OptionsControllerState } from '@web3modal/core'
import { SafeLocalStorage } from '../../../utils/SafeLocalStorage.js'

// -- Types ---------------------------------------------------------------------
export interface AdapterOptions extends Pick<AppKitOptions, 'siweConfig'> {
  ethersConfig: ProviderType
  chains: Chain[]
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

type CoinbaseProviderError = {
  code: number
  message: string
  data: string | undefined
}

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// @ts-expect-error: Overridden state type is correct
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
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
export class EVMEthers5Client implements ChainAdapter<EthersStoreUtilState, number> {
  // -- Private variables -------------------------------------------------------
  private appKit: AppKit | undefined = undefined

  private ethersConfig: AdapterOptions['ethersConfig']

  private hasSyncedConnectedAccount = false

  private EIP6963Providers: EIP6963ProviderDetail[] = []

  private walletConnectProvider?: EthereumProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private projectId = ''

  private options: AppKitOptions | undefined = undefined

  private chains: Chain[]

  public chain: AvailableChain = CommonConstantsUtil.CHAIN.EVM

  private metadata?: Metadata

  private authProvider?: W3mFrameProvider

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public siweControllerClient = this.options?.siweConfig

  public defaultChain: CaipNetwork | undefined = undefined

  public tokens = HelpersUtil.getCaipTokens(this.options?.tokens)

  public constructor(options: AdapterOptions) {
    const { ethersConfig, siweConfig, chains, defaultChain, tokens } = options

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    this.ethersConfig = ethersConfig
    this.siweControllerClient = siweConfig
    this.defaultChain = EthersHelpersUtil.getCaipDefaultChain(defaultChain)
    this.tokens = HelpersUtil.getCaipTokens(tokens)
    this.chains = chains

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          try {
            EthersStoreUtil.setError(undefined)
            await this.switchNetwork(chainId)
          } catch (error) {
            EthersStoreUtil.setError(error)
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)
          if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
            const provider = await this.getWalletConnectProvider()
            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - provider is undefined'
              )
            }
            const ns = provider.signer?.session?.namespaces
            const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
            const nsChains = getChainsFromAccounts(
              ns?.[ConstantsUtil.EIP155]?.accounts || []
            ) as CaipNetworkId[]

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

    this.connectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WalletConnectProvider = await this.getWalletConnectProvider()
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        const params = await siweConfig?.getMessageParams?.()
        // Must perform these checks to satisfy optional types
        if (siweConfig?.options?.enabled && params && Object.keys(params || {}).length > 0) {
          const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe')

          // Make active chain first in requested chains to make it default for siwe message
          const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
          let reorderedChains = params.chains
          if (chainId) {
            reorderedChains = [chainId, ...params.chains.filter(c => c !== chainId)]
          }

          const result = await WalletConnectProvider.authenticate({
            nonce: await siweConfig.getNonce(),
            methods: [...OPTIONAL_METHODS],
            ...params,
            chains: reorderedChains
          })
          // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
          const signedCacao = result?.auths?.[0]
          if (signedCacao) {
            const { p, s } = signedCacao
            const cacaoChainId = getDidChainId(p.iss)
            const address = getDidAddress(p.iss)
            if (address && cacaoChainId) {
              SIWEController.setSession({
                address,
                chainId: parseInt(cacaoChainId, 10)
              })
            }
            try {
              // Kicks off verifyMessage and populates external states
              const message = WalletConnectProvider.signer.client.formatAuthMessage({
                request: p,
                iss: p.iss
              })

              await SIWEController.verifyMessage({
                message,
                signature: s.s,
                cacao: signedCacao
              })
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error verifying message', error)
              // eslint-disable-next-line no-console
              await WalletConnectProvider.disconnect().catch(console.error)
              // eslint-disable-next-line no-console
              await SIWEController.signOut().catch(console.error)
              throw error
            }
          }
        } else {
          await WalletConnectProvider.connect({ optionalChains: this.chains.map(c => c.chainId) })
        }

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
        // If connecting with something else than walletconnect, we need to clear the clientId in the store
        this.appKit?.setClientId(null)
        if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
          const InjectedProvider = ethersConfig.injected
          if (!InjectedProvider) {
            throw new Error('connectionControllerClient:connectInjected - provider is undefined')
          }
          try {
            EthersStoreUtil.setError(undefined)
            await InjectedProvider.request({ method: 'eth_requestAccounts' })
            this.setInjectedProvider(ethersConfig)
          } catch (error) {
            EthersStoreUtil.setError(error)
          }
        } else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
          try {
            EthersStoreUtil.setError(undefined)
            await provider.request({ method: 'eth_requestAccounts' })
          } catch (error) {
            EthersStoreUtil.setError(error)
          }
          this.setEIP6963Provider(provider, info.name)
        } else if (id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
          const CoinbaseProvider = ethersConfig.coinbase
          if (!CoinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined')
          }

          try {
            EthersStoreUtil.setError(undefined)
            await CoinbaseProvider.request({ method: 'eth_requestAccounts' })
            this.setCoinbaseProvider(ethersConfig)
          } catch (error) {
            EthersStoreUtil.setError(error)
            throw new Error((error as CoinbaseProviderError).message)
          }
        }
      },

      checkInstalled: (ids?: string[]) => {
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
        const provider = EthersStoreUtil.state.provider
        const providerType = EthersStoreUtil.state.providerType
        SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
        this.appKit?.setClientId(null)
        if (siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }
        if (
          providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID ||
          providerType === 'coinbaseWalletSDK'
        ) {
          const ethProvider = provider
          await (ethProvider as unknown as EthereumProvider).disconnect()
        } else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && provider) {
          await this.revokeProviderPermissions(provider)
        } else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID) {
          const InjectedProvider = ethersConfig.injected
          if (InjectedProvider) {
            await this.revokeProviderPermissions(InjectedProvider)
          }
        }

        provider?.emit?.('disconnect')
        SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      },

      signMessage: async (message: string) => {
        const provider = EthersStoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }
        const hexMessage = utils.isHexString(message)
          ? message
          : utils.hexlify(utils.toUtf8Bytes(message))
        const signature = await provider.request({
          method: 'personal_sign',
          params: [hexMessage, this.getAddress()]
        })

        return signature as `0x${string}`
      },

      parseUnits: (value: string, decimals: number) =>
        ethers.utils.parseUnits(value, decimals).toBigInt(),

      formatUnits: (value: bigint, decimals: number) => ethers.utils.formatUnits(value, decimals),

      sendTransaction: async (data: SendTransactionArgs) => {
        const provider = EthersStoreUtil.state.provider
        const address = EthersStoreUtil.state.address

        if (data.chainNamespace && data.chainNamespace !== 'eip155') {
          throw new Error('connectionControllerClient:sendTransaction - invalid chain namespace')
        }

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

        const browserProvider = new ethers.providers.Web3Provider(provider)
        const signer = browserProvider.getSigner()

        const txResponse = await signer.sendTransaction(txParams)
        const txReceipt = await txResponse.wait()

        return (txReceipt?.blockHash as `0x${string}`) || null
      }
    }
  }

  public construct(appKit: AppKit, options: OptionsControllerState) {
    if (!options.projectId) {
      throw new Error('web3modal:initialize - projectId is undefined')
    }

    this.appKit = appKit
    this.options = options
    this.projectId = options.projectId
    this.metadata = this.ethersConfig.metadata

    if (this.defaultChain) {
      this.appKit?.setCaipNetwork(this.defaultChain)
    }

    this.createProvider()

    EthersStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    EthersStoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork()
    })

    /*
     * When the client is loaded, this.getChainId stays undefined even if the user switches networks via w3modal <networks> button.
     * This subscribes to the network change and sets the chainId in the store so it can be used when connecting.
     * Especially important for email connector where correct chainId dictates which account is available e.g. smart account, eoa.
     */
    this.appKit?.subscribeCaipNetworkChange(network => {
      if (!this.getChainId() && network) {
        EthersStoreUtil.setChainId(NetworkUtil.caipNetworkIdToNumber(network.id))
      }
    })

    this.appKit?.subscribeShouldUpdateToAddress((address?: string) => {
      if (!address) {
        return
      }
      EthersStoreUtil.setAddress(utils.getAddress(address) as Address)
    })

    this.syncRequestedNetworks(this.chains, this.options?.chainImages)
    this.syncConnectors(this.ethersConfig)

    if (this.ethersConfig.injected) {
      this.checkActiveInjectedProvider(this.ethersConfig)
    }

    if (this.ethersConfig.auth?.email || this.ethersConfig.auth?.socials?.length) {
      this.syncAuthConnector(this.options.projectId, this.ethersConfig.auth)
    }

    if (this.ethersConfig.coinbase) {
      this.checkActiveCoinbaseProvider(this.ethersConfig)
    }

    // Setup EIP6963 providers
    if (typeof window !== 'undefined') {
      this.listenConnectors(true)
      this.checkActive6963Provider()
    }

    this.appKit?.setEIP6963Enabled(this.ethersConfig.EIP6963)
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overridden state type is correct
  public override getState() {
    const state = this.appKit?.getState()

    return {
      ...state,
      selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state?.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overridden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return this.appKit?.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  public setAddress(address?: string) {
    const originalAddress = address ? (utils.getAddress(address) as Address) : undefined
    EthersStoreUtil.setAddress(originalAddress)
  }

  public getAddress() {
    const { address } = EthersStoreUtil.state

    return address ? utils.getAddress(address) : address
  }

  public getError() {
    return EthersStoreUtil.state.error
  }

  public getChainId() {
    return EthersStoreUtil.state.chainId
  }

  public getStatus() {
    return EthersStoreUtil.state.status
  }

  public getIsConnected() {
    return EthersStoreUtil.state.isConnected
  }

  public getWalletProvider() {
    return EthersStoreUtil.state.provider
  }

  public getWalletProviderType() {
    return EthersStoreUtil.state.providerType
  }

  public subscribeProvider(callback: (newState: EthersStoreUtilState) => void) {
    return EthersStoreUtil.subscribe(callback)
  }

  public async disconnect() {
    const { provider, providerType } = EthersStoreUtil.state
    SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
    EthersStoreUtil.reset()

    this.appKit?.setClientId(null)
    if (providerType === 'injected' || providerType === 'eip6963') {
      provider?.emit('disconnect')
    } else {
      await (provider as unknown as EthereumProvider).disconnect()
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
        EthersStoreUtil.setError(undefined)
        await this.createProvider()
      } catch (error) {
        EthersStoreUtil.setError(error)
      }
    }

    return this.walletConnectProvider
  }

  private syncRequestedNetworks(
    chains: AdapterOptions['chains'],
    chainImages?: AdapterOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: CommonConstantsUtil.CHAIN.EVM
        }) as CaipNetwork
    )
    this.appKit?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chain)
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }

    const isConnected = EthersStoreUtil.state.isConnected
    EthersStoreUtil.setStatus(isConnected ? 'connected' : 'disconnected')
  }

  private checkActiveInjectedProvider(config: ProviderType) {
    const InjectedProvider = config.injected
    const walletId = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (InjectedProvider) {
      if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
        this.watchInjected(config)
      }
    }
  }

  private checkActiveCoinbaseProvider(config: ProviderType) {
    const CoinbaseProvider = config.coinbase as unknown as ExternalProvider
    const walletId = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
        if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
          this.watchCoinbase(config)
        } else {
          SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
          EthersStoreUtil.reset()
        }
      }
    }
  }

  private checkActive6963Provider() {
    const currentActiveWallet = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)
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
    SafeLocalStorage.setItem(
      EthersConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    const WalletConnectProvider = await this.getWalletConnectProvider()
    if (WalletConnectProvider) {
      EthersStoreUtil.setChainId(WalletConnectProvider.chainId)
      EthersStoreUtil.setProviderType('walletConnect')
      EthersStoreUtil.setProvider(WalletConnectProvider as unknown as Provider)
      EthersStoreUtil.setStatus('connected')
      EthersStoreUtil.setIsConnected(true)
      this.appKit?.setAllAccounts(
        WalletConnectProvider.accounts.map(address => ({ address, type: 'eoa' })),
        this.chain
      )
      this.setAddress(WalletConnectProvider.accounts?.[0])
      this.watchWalletConnect()
    }
  }

  private async setEIP6963Provider(provider: Provider, name: string) {
    SafeLocalStorage.setItem(EthersConstantsUtil.WALLET_ID, name)

    if (provider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(provider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('eip6963')
        EthersStoreUtil.setProvider(provider)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.appKit?.setAllAccounts(
          addresses.map(address => ({ address, type: 'eoa' })),
          this.chain
        )
        this.setAddress(addresses[0])
        this.watchEIP6963(provider)
      }
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    SafeLocalStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)
    const InjectedProvider = config.injected

    if (InjectedProvider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(InjectedProvider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('injected')
        EthersStoreUtil.setProvider(config.injected)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.appKit?.setAllAccounts(
          addresses.map(address => ({ address, type: 'eoa' })),
          this.chain
        )
        this.setAddress(addresses[0])
        this.watchCoinbase(config)
      }
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    SafeLocalStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_SDK_CONNECTOR_ID)
    const CoinbaseProvider = config.coinbase
    if (CoinbaseProvider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(CoinbaseProvider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('coinbaseWalletSDK')
        EthersStoreUtil.setProvider(config.coinbase)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.appKit?.setAllAccounts(
          addresses.map(address => ({ address, type: 'eoa' })),
          this.chain
        )
        this.setAddress(addresses[0])
        this.watchCoinbase(config)
      }
    }
  }

  private async setAuthProvider() {
    SafeLocalStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.AUTH_CONNECTOR_ID)

    if (this.authProvider) {
      this.appKit?.setLoading(true)
      const {
        address,
        chainId,
        smartAccountDeployed,
        preferredAccountType,
        accounts = []
      } = await this.authProvider.connect({ chainId: this.getChainId() })

      const { smartAccountEnabledNetworks } =
        await this.authProvider.getSmartAccountEnabledNetworks()

      this.appKit?.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, this.chain)
      if (address && chainId) {
        this.appKit?.setAllAccounts(
          accounts.length > 0
            ? accounts
            : [{ address, type: preferredAccountType as 'eoa' | 'smartAccount' }],
          this.chain
        )

        EthersStoreUtil.setChainId(NetworkUtil.parseEvmChainId(chainId))
        EthersStoreUtil.setProviderType(ConstantsUtil.AUTH_CONNECTOR_ID as 'w3mAuth')
        EthersStoreUtil.setProvider(this.authProvider as unknown as CombinedProvider)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        EthersStoreUtil.setAddress(address as Address)
        EthersStoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
        this.appKit?.setSmartAccountDeployed(Boolean(smartAccountDeployed), this.chain)
        this.watchAuth()
        this.watchModal()
      }
      this.appKit?.setLoading(false)
    }
  }

  private async watchWalletConnect() {
    const WalletConnectProvider = await this.getWalletConnectProvider()

    function disconnectHandler() {
      SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      WalletConnectProvider?.removeListener('disconnect', disconnectHandler)
      WalletConnectProvider?.removeListener('accountsChanged', accountsChangedHandler)
      WalletConnectProvider?.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = EthersHelpersUtil.hexStringToNumber(chainId)
        EthersStoreUtil.setChainId(chain)
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
    const InjectedProvider = config.injected

    function disconnectHandler() {
      SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      InjectedProvider?.removeListener('disconnect', disconnectHandler)
      InjectedProvider?.removeListener('accountsChanged', accountsChangedHandler)
      InjectedProvider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        EthersStoreUtil.setAddress(utils.getAddress(currentAccount) as Address)
      } else {
        SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain =
          typeof chainId === 'string'
            ? EthersHelpersUtil.hexStringToNumber(chainId)
            : Number(chainId)
        EthersStoreUtil.setChainId(chain)
      }
    }

    if (InjectedProvider) {
      InjectedProvider.on('disconnect', disconnectHandler)
      InjectedProvider.on('accountsChanged', accountsChangedHandler)
      InjectedProvider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchEIP6963(provider: Provider) {
    const appKit = this.appKit
    const namespace = this.chain

    function disconnectHandler() {
      SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        EthersStoreUtil.setAddress(utils.getAddress(currentAccount) as Address)
        appKit?.setAllAccounts(
          accounts.map(address => ({ address, type: 'eoa' })),
          namespace
        )
      } else {
        appKit?.setAllAccounts([], namespace)
        SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain =
          typeof chainId === 'string'
            ? EthersHelpersUtil.hexStringToNumber(chainId)
            : Number(chainId)
        EthersStoreUtil.setChainId(chain)
      }
    }

    provider.on('disconnect', disconnectHandler)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('chainChanged', chainChangedHandler)
  }

  private watchCoinbase(config: ProviderType) {
    const CoinbaseProvider = config.coinbase
    const walletId = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)

    function disconnectHandler() {
      SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      CoinbaseProvider?.removeListener('disconnect', disconnectHandler)
      CoinbaseProvider?.removeListener('accountsChanged', accountsChangedHandler)
      CoinbaseProvider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        SafeLocalStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      } else {
        EthersStoreUtil.setAddress(accounts[0] as Address)
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId && walletId === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
        const chain = Number(chainId)
        EthersStoreUtil.setChainId(chain)
      }
    }

    if (CoinbaseProvider) {
      CoinbaseProvider.on('disconnect', disconnectHandler)
      CoinbaseProvider.on('accountsChanged', accountsChangedHandler)
      CoinbaseProvider.on('chainChanged', chainChangedHandler)
    }
  }

  private watchAuth() {
    if (this.authProvider) {
      this.authProvider.onRpcRequest(request => {
        if (W3mFrameHelpers.checkIfRequestExists(request)) {
          // If it's not a safe request, show the approve transaction modal
          if (!W3mFrameHelpers.checkIfRequestIsSafe(request)) {
            this.appKit?.handleUnsafeRPCRequest()
          }
        } else {
          this.appKit?.open()
          // eslint-disable-next-line no-console
          console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
            method: request.method
          })
          setTimeout(() => {
            this.appKit?.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
          }, 300)
        }
      })

      this.authProvider.onRpcError(() => {
        const isModalOpen = this.appKit?.isOpen()

        if (isModalOpen) {
          if (this.appKit?.isTransactionStackEmpty()) {
            this.appKit?.close()
          } else {
            this.appKit?.popTransactionStack(true)
          }
        }
      })

      this.authProvider.onRpcSuccess((_, request) => {
        const isSafeRequest = W3mFrameHelpers.checkIfRequestIsSafe(request)

        if (isSafeRequest) {
          return
        }

        if (this.appKit?.isTransactionStackEmpty()) {
          this.appKit?.close()
        } else {
          this.appKit?.popTransactionStack()
        }
      })

      this.authProvider.onNotConnected(() => {
        this.appKit?.setIsConnected(false, this.chain)
        this.appKit?.setLoading(false)
      })

      this.authProvider.onIsConnected(({ preferredAccountType }) => {
        this.appKit?.setIsConnected(true, this.chain)
        this.appKit?.setLoading(false)
        EthersStoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
      })

      this.authProvider.onSetPreferredAccount(({ address, type }) => {
        if (!address) {
          return
        }
        this.appKit?.setLoading(true)
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
        EthersStoreUtil.setAddress(address as Address)
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        EthersStoreUtil.setPreferredAccountType(type as W3mFrameTypes.AccountType)
        this.syncAccount().then(() => this.appKit?.setLoading(false))
      })
    }
  }

  private watchModal() {
    if (this.authProvider) {
      this.subscribeState(val => {
        if (!val.open) {
          this.authProvider?.rejectRpcRequests()
        }
      })
    }
  }

  private async syncAccount() {
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected

    this.appKit?.resetAccount(this.chain)

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

      this.appKit?.setIsConnected(isConnected, this.chain)

      this.appKit?.setCaipAddress(caipAddress, this.chain)
      this.syncConnectedWalletInfo()

      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address),
        this.appKit?.setApprovedCaipNetworksData(this.chain)
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
      this.appKit?.setAllAccounts([], this.chain)
    }
  }

  private async syncNetwork() {
    const chainImages = this.options?.chainImages
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chain.chainId}`

        this.appKit?.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: this.chain
        })
        if (isConnected && address) {
          const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`
          this.appKit?.setCaipAddress(caipAddress, this.chain)
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/address/${address}`
            this.appKit?.setAddressExplorerUrl(url, this.chain)
          } else {
            this.appKit?.setAddressExplorerUrl(undefined, this.chain)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncBalance(address)
          }
        }
      } else if (isConnected) {
        this.appKit?.setCaipNetwork({
          id: `${ConstantsUtil.EIP155}:${chainId}`,
          chain: this.chain
        })
      }
    }
  }

  private async syncWalletConnectName(address: Address) {
    try {
      const registeredWcNames = await this.appKit?.getWalletConnectName(address)
      if (registeredWcNames?.[0]) {
        const wcName = registeredWcNames[0]
        this.appKit?.setProfileName(wcName.name, this.chain)
      } else {
        this.appKit?.setProfileName(null, this.chain)
      }
    } catch {
      this.appKit?.setProfileName(null, this.chain)
    }
  }

  private async syncProfile(address: Address) {
    const chainId = EthersStoreUtil.state.chainId

    try {
      const identity = await this.appKit?.fetchIdentity({
        address
      })
      const name = identity?.name
      const avatar = identity?.avatar

      this.appKit?.setProfileName(name, this.chain)
      this.appKit?.setProfileImage(avatar, this.chain)

      if (!name) {
        await this.syncWalletConnectName(address)
      }
    } catch {
      if (chainId === 1) {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet')
        const name = await ensProvider.lookupAddress(address)
        const avatar = await ensProvider.getAvatar(address)

        if (name) {
          this.appKit?.setProfileName(name, this.chain)
        }
        if (avatar) {
          this.appKit?.setProfileImage(avatar, this.chain)
        }
      } else {
        this.appKit?.setProfileName(null, this.chain)
        this.appKit?.setProfileImage(null, this.chain)
      }
    }
  }

  private async syncBalance(address: Address) {
    const chainId = EthersStoreUtil.state.chainId
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
          this.appKit?.setBalance(formattedBalance, chain.currency, this.chain)
        }
      }
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = SafeLocalStorage.getItem(EthersConstantsUtil.WALLET_ID)
    const providerType = EthersStoreUtil.state.providerType

    if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      if (currentActiveWallet) {
        const currentProvider = this.EIP6963Providers.find(
          provider => provider.info.name === currentActiveWallet
        )

        if (currentProvider) {
          this.appKit?.setConnectedWalletInfo({ ...currentProvider.info }, this.chain)
        }
      }
    } else if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
      const provider = EthersStoreUtil.state.provider as unknown as EthereumProvider

      if (provider.session) {
        this.appKit?.setConnectedWalletInfo(
          {
            ...provider.session.peer.metadata,
            name: provider.session.peer.metadata.name,
            icon: provider.session.peer.metadata.icons?.[0]
          },
          this.chain
        )
      }
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, this.chain)
    }
  }

  public async switchNetwork(chainId: number) {
    const provider = EthersStoreUtil.state.provider
    const providerType = EthersStoreUtil.state.providerType
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            const message = switchError?.message as string
            if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
              throw new Error('Chain is not supported')
            }
            await EthersHelpersUtil.addEthereumChain(
              WalletConnectProvider as unknown as Provider,
              chain
            )
          }
        }
      } else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID && chain) {
        const InjectedProvider = provider
        if (InjectedProvider) {
          try {
            await InjectedProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(InjectedProvider, chain)
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
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(EIP6963Provider, chain)
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID && chain) {
        const CoinbaseProvider = provider
        if (CoinbaseProvider) {
          try {
            await CoinbaseProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain)
            } else {
              throw new Error('Error switching network')
            }
          }
        }
      } else if (providerType === ConstantsUtil.AUTH_CONNECTOR_ID) {
        if (this.authProvider && chain?.chainId) {
          try {
            this.appKit?.setLoading(true)
            await this.authProvider.switchNetwork(chain?.chainId)
            EthersStoreUtil.setChainId(chain.chainId)

            const { address, preferredAccountType } = await this.authProvider.connect({
              chainId: chain?.chainId
            })

            EthersStoreUtil.setAddress(address as Address)
            EthersStoreUtil.setPreferredAccountType(
              preferredAccountType as W3mFrameTypes.AccountType
            )
            await this.syncAccount()
          } catch {
            throw new Error('Switching chain failed')
          } finally {
            this.appKit?.setLoading(false)
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
        type: connectorType,
        chain: this.chain
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
          type: injectedConnectorType,
          chain: this.chain
        })
      }
    }

    if (config.coinbase) {
      w3mConnectors.push({
        id: ConstantsUtil.COINBASE_SDK_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
        type: 'EXTERNAL',
        chain: this.chain
      })
    }

    this.appKit?.setConnectors(w3mConnectors)
  }

  private async syncAuthConnector(projectId: string, auth: ProviderType['auth']) {
    if (typeof window !== 'undefined') {
      this.authProvider = new W3mFrameProvider(projectId)

      this.appKit?.addConnector({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        name: 'Auth',
        provider: this.authProvider,
        email: auth?.email,
        socials: auth?.socials,
        showWallets: auth?.showWallets === undefined ? true : auth.showWallets,
        chain: this.chain,
        walletFeatures: auth?.walletFeatures
      })

      this.appKit?.setLoading(true)
      const isLoginEmailUsed = this.authProvider.getLoginEmailUsed()
      this.appKit?.setLoading(isLoginEmailUsed)
      const { isConnected } = await this.authProvider.isConnected()
      if (isConnected) {
        await this.setAuthProvider()
      } else {
        this.appKit?.setLoading(false)
      }
    }
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const connectors = this.appKit?.getConnectors()
      const existingConnector = connectors?.find(c => c.name === info.name)

      if (!existingConnector) {
        const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]
        if (type) {
          this.appKit?.addConnector({
            id: ConstantsUtil.EIP6963_CONNECTOR_ID,
            type,
            imageUrl:
              info.icon ?? this.options?.connectorImages?.[ConstantsUtil.EIP6963_CONNECTOR_ID],
            name: info.name,
            provider,
            info,
            chain: this.chain
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

  private async revokeProviderPermissions(provider: Provider) {
    try {
      const permissions: { parentCapability: string }[] = await provider.request({
        method: 'wallet_getPermissions'
      })
      const ethAccountsPermission = permissions.find(
        permission => permission.parentCapability === 'eth_accounts'
      )

      if (ethAccountsPermission) {
        await provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.info('Could not revoke permissions from wallet. Disconnecting...', error)
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
