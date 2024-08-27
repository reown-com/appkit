/* eslint-disable max-depth */
import type {
  ConnectionControllerClient,
  Connector,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs
} from '@web3modal/core'
import type { AdapterType, CaipAddress, CaipNetwork, CaipNetworkId } from '@web3modal/common'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
import { getChainsFromAccounts } from '@walletconnect/utils'
import type {
  Address,
  Metadata,
  ProviderType,
  Provider,
  EthersStoreUtilState
} from '@web3modal/scaffold-utils/ethers'
import { ethers, utils } from 'ethers5'
import {
  EthersConstantsUtil,
  EthersHelpersUtil,
  EthersStoreUtil
} from '@web3modal/scaffold-utils/ethers'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import { NetworkUtil } from '@web3modal/common'
import type { ChainNamespace } from '@web3modal/common'
import type { AppKit } from '../../../src/client.js'
import type { AppKitOptions } from '../../../utils/TypesUtil.js'

// -- Types ---------------------------------------------------------------------
export interface AdapterOptions {
  ethersConfig: ProviderType
  defaultCaipNetwork?: CaipNetwork
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
export class EVMEthers5Client {
  // -- Private variables -------------------------------------------------------
  private appKit: AppKit | undefined = undefined

  private ethersConfig: AdapterOptions['ethersConfig']

  private hasSyncedConnectedAccount = false

  private EIP6963Providers: EIP6963ProviderDetail[] = []

  private walletConnectProvider?: EthereumProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private projectId = ''

  private options: AppKitOptions | undefined = undefined

  private caipNetworks: CaipNetwork[] = []

  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.EVM

  private metadata?: Metadata

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  public tokens = HelpersUtil.getCaipTokens(this.options?.tokens)

  public adapterType: AdapterType = 'ethers5'

  public constructor(options: AdapterOptions) {
    const { ethersConfig } = options

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    this.ethersConfig = ethersConfig

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id))
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
          const walletChoice = localStorage.getItem(EthersConstantsUtil.WALLET_ID)
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

        const params = await this.options?.siweConfig?.getMessageParams?.()
        // Must perform these checks to satisfy optional types
        if (
          this.options?.siweConfig?.options?.enabled &&
          params &&
          Object.keys(params || {}).length > 0
        ) {
          const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe')

          // Make active chain first in requested chains to make it default for siwe message
          const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
          let reorderedChains = params.chains
          if (chainId) {
            reorderedChains = [Number(chainId), ...params.chains.filter(c => c !== Number(chainId))]
          }

          const result = await WalletConnectProvider.authenticate({
            nonce: await this.options?.siweConfig?.getNonce(),
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
          await WalletConnectProvider.connect({
            optionalChains: this.caipNetworks.map(c => Number(c.chainId))
          })
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
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
        this.appKit?.setClientId(null)
        if (this.options?.siweConfig?.options?.signOutOnDisconnect) {
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
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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

  public construct(appKit: AppKit, options: AppKitOptions) {
    if (!options.projectId) {
      throw new Error('web3modal:initialize - projectId is undefined')
    }

    this.appKit = appKit
    this.options = options
    this.projectId = options.projectId
    this.metadata = this.ethersConfig.metadata
    this.defaultCaipNetwork = {
      ...EthersHelpersUtil.getCaipDefaultChain(options?.defaultCaipNetwork),
      chain: CommonConstantsUtil.CHAIN.EVM
    } as CaipNetwork
    this.tokens = HelpersUtil.getCaipTokens(options?.tokens)
    this.caipNetworks = options.caipNetworks

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
        EthersStoreUtil.setChainId(Number(NetworkUtil.caipNetworkIdToNumber(network.id)))
      }
    })

    this.appKit?.subscribeShouldUpdateToAddress((address?: string) => {
      if (!address) {
        return
      }
      EthersStoreUtil.setAddress(utils.getAddress(address) as Address)
    })

    this.syncRequestedNetworks(this.caipNetworks, this.options?.chainImages)
    this.syncConnectors(this.ethersConfig)

    if (this.ethersConfig.injected) {
      this.checkActiveInjectedProvider(this.ethersConfig)
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
        selectedNetworkId: Number(NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId))
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
    localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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
      rpcMap: this.caipNetworks
        ? this.caipNetworks.reduce<Record<number, string>>((map, chain) => {
            map[Number(chain.chainId)] = chain.rpcUrl

            return map
          }, {})
        : ({} as Record<number, string>),
      optionalChains: [...this.caipNetworks.map(chain => chain.chainId)] as [number],
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
    caipNetworks: AppKitOptions['caipNetworks'],
    chainImages?: AppKitOptions['chainImages']
  ) {
    const requestedCaipNetworks = caipNetworks?.map(
      caipNetwork =>
        ({
          id: `${ConstantsUtil.EIP155}:${caipNetwork.chainId}`,
          name: caipNetwork.name,
          imageId: PresetsUtil.NetworkImageIds[caipNetwork.chainId],
          imageUrl: chainImages?.[Number(caipNetwork.chainId)]
        }) as CaipNetwork
    )
    this.appKit?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chainNamespace)
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)

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
    const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (InjectedProvider) {
      if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
        this.watchInjected(config)
      }
    }
  }

  private checkActiveCoinbaseProvider(config: ProviderType) {
    const CoinbaseProvider = config.coinbase as unknown as ExternalProvider
    const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
        if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
          this.watchCoinbase(config)
        } else {
          localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
          EthersStoreUtil.reset()
        }
      }
    }
  }

  private checkActive6963Provider() {
    const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID)
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
      this.setAddress(WalletConnectProvider.accounts?.[0])
      this.watchWalletConnect()
    }
  }

  private async setEIP6963Provider(provider: Provider, name: string) {
    window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, name)

    if (provider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(provider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('eip6963')
        EthersStoreUtil.setProvider(provider)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.setAddress(addresses[0])
        this.watchEIP6963(provider)
      }
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)
    const InjectedProvider = config.injected

    if (InjectedProvider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(InjectedProvider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('injected')
        EthersStoreUtil.setProvider(config.injected)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.setAddress(addresses[0])
        this.watchCoinbase(config)
      }
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    window?.localStorage.setItem(
      EthersConstantsUtil.WALLET_ID,
      ConstantsUtil.COINBASE_SDK_CONNECTOR_ID
    )
    const CoinbaseProvider = config.coinbase
    if (CoinbaseProvider) {
      const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(CoinbaseProvider)
      if (addresses?.[0] && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType('coinbaseWalletSDK')
        EthersStoreUtil.setProvider(config.coinbase)
        EthersStoreUtil.setStatus('connected')
        EthersStoreUtil.setIsConnected(true)
        this.setAddress(addresses[0])
        this.watchCoinbase(config)
      }
    }
  }

  private async watchWalletConnect() {
    const WalletConnectProvider = await this.getWalletConnectProvider()

    function disconnectHandler() {
      localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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
      localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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
    function disconnectHandler() {
      localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      provider.removeListener('disconnect', disconnectHandler)
      provider.removeListener('accountsChanged', accountsChangedHandler)
      provider.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        EthersStoreUtil.setAddress(utils.getAddress(currentAccount) as Address)
      } else {
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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
    const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)

    function disconnectHandler() {
      localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      CoinbaseProvider?.removeListener('disconnect', disconnectHandler)
      CoinbaseProvider?.removeListener('accountsChanged', accountsChangedHandler)
      CoinbaseProvider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
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

  private async syncAccount() {
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected

    this.appKit?.resetAccount(this.chainNamespace)

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

      this.appKit?.setIsConnected(isConnected, this.chainNamespace)

      this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
      this.syncConnectedWalletInfo()

      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address),
        this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
    }
  }

  private async syncNetwork() {
    const chainImages = this.options?.chainImages
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected
    if (this.caipNetworks) {
      const chain = this.caipNetworks.find(c => c.chainId === chainId)

      if (chain) {
        const caipChainId: CaipNetworkId = `eip155:${chain.chainId}` as CaipNetworkId

        this.appKit?.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[Number(chain.chainId)],
          chainNamespace: this.chainNamespace,
          chainId: chain.chainId,
          currency: chain.currency,
          explorerUrl: chain.explorerUrl,
          rpcUrl: chain.rpcUrl
        })
        if (isConnected && address) {
          const caipAddress: CaipAddress = `eip155:${chainId}:${address}`
          this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/address/${address}`
            this.appKit?.setAddressExplorerUrl(url, this.chainNamespace)
          } else {
            this.appKit?.setAddressExplorerUrl(undefined, this.chainNamespace)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncBalance(address)
          }
        }
      } else if (isConnected) {
        this.appKit?.setCaipNetwork({
          id: `${ConstantsUtil.EIP155}:${chainId}` as CaipNetworkId,
          chainNamespace: this.chainNamespace,
          chainId: chainId as number,
          // Fill these
          name: '',
          currency: '',
          explorerUrl: '',
          rpcUrl: ''
        })
      }
    }
  }

  private async syncWalletConnectName(address: Address) {
    try {
      const registeredWcNames = await this.appKit?.getWalletConnectName(address)
      if (registeredWcNames?.[0]) {
        const wcName = registeredWcNames[0]
        this.appKit?.setProfileName(wcName.name, this.chainNamespace)
      } else {
        this.appKit?.setProfileName(null, this.chainNamespace)
      }
    } catch {
      this.appKit?.setProfileName(null, this.chainNamespace)
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

      this.appKit?.setProfileName(name, this.chainNamespace)
      this.appKit?.setProfileImage(avatar, this.chainNamespace)

      if (!name) {
        await this.syncWalletConnectName(address)
      }
    } catch {
      if (chainId === 1) {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet')
        const name = await ensProvider.lookupAddress(address)
        const avatar = await ensProvider.getAvatar(address)

        if (name) {
          this.appKit?.setProfileName(name, this.chainNamespace)
        }
        if (avatar) {
          this.appKit?.setProfileImage(avatar, this.chainNamespace)
        }
      } else {
        this.appKit?.setProfileName(null, this.chainNamespace)
        this.appKit?.setProfileImage(null, this.chainNamespace)
      }
    }
  }

  private async syncBalance(address: Address) {
    const chainId = EthersStoreUtil.state.chainId
    if (chainId && this.caipNetworks) {
      const chain = this.caipNetworks.find(c => c.chainId === chainId)

      if (chain) {
        const JsonRpcProvider = new ethers.providers.JsonRpcProvider(chain.rpcUrl, {
          chainId,
          name: chain.name
        })
        if (JsonRpcProvider) {
          const balance = await JsonRpcProvider.getBalance(address)
          const formattedBalance = utils.formatEther(balance)
          this.appKit?.setBalance(formattedBalance, chain.currency, this.chainNamespace)
        }
      }
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID)
    const providerType = EthersStoreUtil.state.providerType

    if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      if (currentActiveWallet) {
        const currentProvider = this.EIP6963Providers.find(
          provider => provider.info.name === currentActiveWallet
        )

        if (currentProvider) {
          this.appKit?.setConnectedWalletInfo({ ...currentProvider.info }, this.chainNamespace)
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
          this.chainNamespace
        )
      }
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, this.chainNamespace)
    }
  }

  public async switchNetwork(chainId: number) {
    const provider = EthersStoreUtil.state.provider
    const providerType = EthersStoreUtil.state.providerType
    if (this.caipNetworks) {
      const chain = this.caipNetworks.find(c => c.chainId === chainId)

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
      } else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && chain) {
        const EIP6963Provider = provider

        if (EIP6963Provider) {
          try {
            await EIP6963Provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(Number(chain.chainId))
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
            EthersStoreUtil.setChainId(Number(chain.chainId))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain)
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
        type: connectorType,
        chain: this.chainNamespace
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
          chain: this.chainNamespace
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
        chain: this.chainNamespace
      })
    }

    this.appKit?.setConnectors(w3mConnectors)
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const connectors = this.appKit?.getConnectors()
      const existingConnector = connectors?.find(c => c.name === info.name)
      const coinbaseConnector = connectors?.find(
        c => c.id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID
      )
      const isCoinbaseDuplicated =
        coinbaseConnector &&
        event.detail.info.rdns ===
          ConstantsUtil.CONNECTOR_RDNS_MAP[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID]

      if (!existingConnector && !isCoinbaseDuplicated) {
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
            chain: this.chainNamespace
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
