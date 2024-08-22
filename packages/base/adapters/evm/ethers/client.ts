import type { AppKitOptions } from '../../../utils/TypesUtil.js'
import {
  NetworkUtil,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace
} from '@web3modal/common'
import type { CombinedProvider, Connector } from '@web3modal/core'
import {
  EthersHelpersUtil,
  type Provider,
  type ProviderType,
  type ProviderId,
  type Address
} from '@web3modal/scaffold-utils/ethers'
import type { AppKit } from '../../../src/client.js'
import {
  W3mFrameHelpers,
  W3mFrameProvider,
  W3mFrameRpcConstants,
  type W3mFrameTypes
} from '@web3modal/wallet'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { ConnectionControllerClient, NetworkControllerClient } from '@web3modal/core'
import { WcConstantsUtil } from '../../../utils/ConstantsUtil.js'
import { EthersMethods } from './utils/EthersMethods.js'
import { formatEther, InfuraProvider, JsonRpcProvider } from 'ethers'
import { EthersStoreUtil } from './utils/EthersStoreUtil.js'
import type { PublicStateControllerState } from '@web3modal/core'

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

interface ExternalProvider extends Provider {
  accounts: string[]
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

export class EVMEthersClient {
  private appKit: AppKit | undefined = undefined

  private hasSyncedConnectedAccount = false

  private EIP6963Providers: EIP6963ProviderDetail[] = []

  private caipNetworks: CaipNetwork[] = []

  private ethersConfig: AdapterOptions['ethersConfig']

  private authProvider?: W3mFrameProvider

  // -- Public variables --------------------------------------------------------
  public options: AppKitOptions | undefined = undefined

  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.EVM

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public siweControllerClient = this.options?.siweConfig

  public tokens = HelpersUtil.getCaipTokens(this.options?.tokens)

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  // -- Public -------------------------------------------------------------------
  public constructor(options: AdapterOptions) {
    const { ethersConfig } = options

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    this.ethersConfig = ethersConfig

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (caipNetwork?.chainId) {
          try {
            // WcStoreUtil.setError(undefined)
            await this.switchNetwork(caipNetwork)
          } catch (error) {
            // WcStoreUtil.setError(error)
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () => {
        const provider = await this.appKit?.universalAdapter?.getWalletConnectProvider()

        return new Promise(resolve => {
          const ns = provider?.session?.namespaces

          const nsChains: CaipNetworkId[] | undefined = []

          if (ns) {
            Object.keys(ns).forEach(key => {
              const chains = ns?.[key]?.chains
              if (chains) {
                nsChains.push(...(chains as `${ChainNamespace}:${string}`[]))
              }
            })
          }
          const result = {
            supportsAllNetworks: false,
            approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
          }

          resolve(result)
        })
      }
    }

    this.connectionControllerClient = {
      connectWalletConnect: async onUri => {
        await this.appKit?.universalAdapter?.connectionControllerClient.connectWalletConnect(onUri)
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
        this.appKit?.setClientId(null)

        const connectorConfig = {
          [ConstantsUtil.INJECTED_CONNECTOR_ID]: {
            getProvider: () => ethersConfig.injected,
            providerType: 'injected' as const
          },
          [ConstantsUtil.EIP6963_CONNECTOR_ID]: {
            getProvider: () => provider,
            providerType: 'eip6963' as const
          },
          [ConstantsUtil.COINBASE_SDK_CONNECTOR_ID]: {
            getProvider: () => ethersConfig.coinbase,
            providerType: 'coinbase' as const
          },
          [ConstantsUtil.AUTH_CONNECTOR_ID]: {
            getProvider: () => ethersConfig.auth,
            providerType: 'auth' as const
          }
        }

        const selectedConnector = connectorConfig[id]

        if (!selectedConnector) {
          throw new Error(`Unsupported connector ID: ${id}`)
        }

        const selectedProvider = selectedConnector.getProvider() as Provider

        if (!selectedProvider) {
          throw new Error(`Provider for connector ${id} is undefined`)
        }

        try {
          // WcStoreUtil.setError(undefined)
          if (selectedProvider) {
            await selectedProvider.request({ method: 'eth_requestAccounts' })
          }
          await this.setProvider(
            selectedProvider,
            selectedConnector.providerType as ProviderId,
            info.name
          )
        } catch (error) {
          // WcStoreUtil.setError(error)
          if (id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
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
        const providerId = EthersStoreUtil.state.providerId

        this.appKit?.setClientId(null)
        if (this.options?.siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }

        const disconnectConfig = {
          [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: async () =>
            await this.appKit?.universalAdapter?.connectionControllerClient.disconnect(),

          coinbaseWalletSDK: async () =>
            await this.appKit?.universalAdapter?.connectionControllerClient.disconnect(),

          [ConstantsUtil.AUTH_CONNECTOR_ID]: async () => {
            await this.authProvider?.disconnect()
          },

          [ConstantsUtil.EIP6963_CONNECTOR_ID]: async () => {
            if (provider) {
              provider.emit('disconnect')
              await this.revokeProviderPermissions(provider)
            }
          },
          [ConstantsUtil.INJECTED_CONNECTOR_ID]: async () => {
            if (provider) {
              provider.emit('disconnect')
              await this.revokeProviderPermissions(provider)
            }
          }
        }
        const disconnectFunction = disconnectConfig[providerId as string]

        if (disconnectFunction) {
          await disconnectFunction()
        } else {
          console.warn(`No disconnect function found for provider type: ${providerId}`)
        }

        // Common cleanup actions
        localStorage.removeItem(WcConstantsUtil.WALLET_ID)
        this.appKit?.resetAccount('eip155')
      },
      signMessage: async (message: string) => {
        const provider = EthersStoreUtil.state.provider as Provider
        const address = this.appKit?.getAddress()

        if (!address) {
          throw new Error('Address is undefined')
        }

        return await EthersMethods.signMessage(message, provider, address)
      },

      parseUnits: EthersMethods.parseUnits,
      formatUnits: EthersMethods.formatUnits,

      estimateGas: async data => {
        const provider = EthersStoreUtil.state.provider as Provider
        const address = this.appKit?.getAddress()
        const caipNetwork = this.appKit?.getCaipNetwork()

        if (!address) {
          throw new Error('Address is undefined')
        }

        return await EthersMethods.estimateGas(
          data,
          provider,
          address,
          Number(caipNetwork?.chainId)
        )
      },

      sendTransaction: async data => {
        const provider = EthersStoreUtil.state.provider as Provider
        const address = this.appKit?.getAddress()
        const caipNetwork = this.appKit?.getCaipNetwork()

        if (!address) {
          throw new Error('Address is undefined')
        }

        return await EthersMethods.sendTransaction(
          data,
          provider,
          address,
          Number(caipNetwork?.chainId)
        )
      },

      writeContract: async data => {
        const provider = EthersStoreUtil.state.provider as Provider
        const address = this.appKit?.getAddress()
        const caipNetwork = this.appKit?.getCaipNetwork()

        if (!address) {
          throw new Error('Address is undefined')
        }

        return await EthersMethods.writeContract(
          data,
          provider,
          address,
          Number(caipNetwork?.chainId)
        )
      },

      getEnsAddress: async (value: string) => {
        if (this.appKit) {
          return await EthersMethods.getEnsAddress(value, this.appKit)
        }

        return false
      },

      getEnsAvatar: async (value: string) => {
        const caipNetwork = this.appKit?.getCaipNetwork()

        return await EthersMethods.getEnsAvatar(value, Number(caipNetwork?.chainId))
      }
    }
  }

  public construct(appKit: AppKit, options: AppKitOptions) {
    if (!options.projectId) {
      throw new Error('appkit:ethers-client:initialize - projectId is undefined')
    }

    this.appKit = appKit
    this.options = options
    this.caipNetworks = options.caipNetworks
    this.defaultCaipNetwork = options.defaultCaipNetwork
    this.tokens = HelpersUtil.getCaipTokens(options.tokens)

    this.syncConnectors(this.ethersConfig)

    if (typeof window !== 'undefined') {
      this.listenConnectors(true)
    }

    this.appKit?.setEIP6963Enabled(this.ethersConfig.EIP6963)

    if (this.ethersConfig.auth) {
      this.syncAuthConnector(this.options.projectId, this.ethersConfig.auth)
    }

    this.checkActiveProviders(this.ethersConfig)
    this.syncRequestedNetworks(this.caipNetworks)
  }

  public subscribeState(callback: (state: PublicStateControllerState) => void) {
    return this.appKit?.subscribeState(state => callback(state))
  }

  public async disconnect() {
    await this.connectionControllerClient.disconnect()
  }

  // -- Private -----------------------------------------------------------------
  private async revokeProviderPermissions(provider: Provider | CombinedProvider) {
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

  private checkActiveProviders(config: ProviderType) {
    const walletId = localStorage.getItem(WcConstantsUtil.WALLET_ID)
    const walletName = localStorage.getItem(WcConstantsUtil.WALLET_NAME)

    if (!walletId) {
      return
    }

    const providerConfigs = {
      [ConstantsUtil.INJECTED_CONNECTOR_ID]: {
        provider: config.injected
      },
      [ConstantsUtil.COINBASE_SDK_CONNECTOR_ID]: {
        provider: config.coinbase as unknown as ExternalProvider
      },
      [ConstantsUtil.EIP6963_CONNECTOR_ID]: {
        provider: this.EIP6963Providers.find(p => p.info.name === walletName)?.provider
      }
    }

    const activeConfig = providerConfigs[walletId as unknown as keyof typeof providerConfigs]

    if (activeConfig?.provider) {
      this.setProvider(activeConfig.provider, walletId as ProviderId)
      this.setupProviderListeners(activeConfig.provider, walletId as ProviderId)
    }
  }

  private async setProvider(provider: Provider, providerId: ProviderId, name?: string) {
    if (providerId === 'w3mAuth') {
      // this.setAuthProvider()
    } else {
      const walletId = providerId

      window?.localStorage.setItem(WcConstantsUtil.WALLET_ID, walletId)
      if (name) {
        window?.localStorage.setItem(WcConstantsUtil.WALLET_NAME, name)
      }

      if (provider) {
        const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(provider)
        const caipNetwork = this.caipNetworks.find(c => c.chainId === chainId)

        if (addresses?.[0] && chainId && caipNetwork) {
          this.appKit?.setCaipNetwork(caipNetwork)
          this.appKit?.setCaipAddress(
            `${this.chainNamespace}:${chainId}:${addresses[0]}`,
            this.chainNamespace
          )
          EthersStoreUtil.setProviderId(providerId)
          EthersStoreUtil.setProvider(provider)
          this.appKit?.setStatus('connected', this.chainNamespace)
          this.appKit?.setIsConnected(true, this.chainNamespace)
          this.appKit?.setAllAccounts(
            addresses.map(address => ({ address, type: 'eoa' })),
            this.chainNamespace
          )
        }
      }
    }
  }

  private async setAuthProvider() {
    window?.localStorage.setItem(WcConstantsUtil.WALLET_ID, ConstantsUtil.AUTH_CONNECTOR_ID)

    if (this.authProvider) {
      this.appKit?.setLoading(true)
      const {
        address,
        chainId,
        smartAccountDeployed,
        preferredAccountType,
        accounts = []
      } = await this.authProvider.connect({
        chainId: Number(
          NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id) ??
            this.caipNetworks[0]?.chainId
        )
      })

      const { smartAccountEnabledNetworks } =
        await this.authProvider.getSmartAccountEnabledNetworks()

      this.appKit?.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, this.chainNamespace)
      if (address && chainId) {
        this.appKit?.setAllAccounts(
          accounts.length > 0
            ? accounts
            : [{ address, type: preferredAccountType as 'eoa' | 'smartAccount' }],
          this.chainNamespace
        )
        const caipNetwork = this.caipNetworks.find(c => c.chainId === chainId)
        this.appKit?.setCaipNetwork(caipNetwork)
        this.appKit?.setStatus('connected', this.chainNamespace)
        this.appKit?.setIsConnected(true, this.chainNamespace)
        this.appKit?.setCaipAddress(
          `${this.chainNamespace}:${chainId}:${address}`,
          this.chainNamespace
        )
        this.appKit?.setPreferredAccountType(
          preferredAccountType as W3mFrameTypes.AccountType,
          this.chainNamespace
        )
        this.appKit?.setSmartAccountDeployed(Boolean(smartAccountDeployed), this.chainNamespace)
        EthersStoreUtil.setProvider(this.authProvider as unknown as Provider)
        EthersStoreUtil.setProviderId(ConstantsUtil.AUTH_CONNECTOR_ID as ProviderId)
        this.setupProviderListeners(this.authProvider as unknown as Provider, 'w3mAuth')
        this.watchModal()
      }
      this.appKit?.setLoading(false)
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

  private setupProviderListeners(provider: Provider, providerId: ProviderId) {
    const disconnectHandler = () => {
      localStorage.removeItem(WcConstantsUtil.WALLET_ID)
      this.removeListeners(provider)
    }

    const accountsChangedHandler = (accounts: string[]) => {
      const currentAccount = accounts?.[0] as CaipAddress | undefined
      if (currentAccount) {
        this.appKit?.setCaipAddress(currentAccount, this.chainNamespace)

        if (providerId === ConstantsUtil.EIP6963_CONNECTOR_ID) {
          this.appKit?.setAllAccounts(
            accounts.map(address => ({ address, type: 'eoa' })),
            this.chainNamespace
          )
        }
      } else {
        if (providerId === ConstantsUtil.EIP6963_CONNECTOR_ID) {
          this.appKit?.setAllAccounts([], this.chainNamespace)
        }
        localStorage.removeItem(WcConstantsUtil.WALLET_ID)
        this.appKit?.resetAccount('eip155')
      }
    }

    const chainChangedHandler = (networkId: string) => {
      if (networkId) {
        const networkIdNumber =
          typeof networkId === 'string'
            ? EthersHelpersUtil.hexStringToNumber(networkId)
            : Number(networkId)
        const caipNetwork = this.caipNetworks.find(c => c.chainId === networkIdNumber)
        this.appKit?.setCaipNetwork(caipNetwork)
      }
    }

    if (providerId === ConstantsUtil.AUTH_CONNECTOR_ID) {
      this.setupAuthListeners(provider as unknown as W3mFrameProvider)
    } else {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }

    this.providerHandlers = {
      disconnect: disconnectHandler,
      accountsChanged: accountsChangedHandler,
      chainChanged: chainChangedHandler
    }
  }

  private providerHandlers: {
    disconnect: () => void
    accountsChanged: (accounts: string[]) => void
    chainChanged: (networkId: string) => void
  } | null = null

  private removeListeners(provider: Provider) {
    if (this.providerHandlers) {
      provider.removeListener('disconnect', this.providerHandlers.disconnect)
      provider.removeListener('accountsChanged', this.providerHandlers.accountsChanged)
      provider.removeListener('chainChanged', this.providerHandlers.chainChanged)
      this.providerHandlers = null
    }
  }

  private setupAuthListeners(authProvider: W3mFrameProvider) {
    authProvider.onRpcRequest(request => {
      if (W3mFrameHelpers.checkIfRequestExists(request)) {
        if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
          this.handleAuthRpcRequest()
        }
      } else {
        this.handleInvalidAuthRequest(request)
      }
    })

    authProvider.onRpcError(() => this.handleAuthRpcError())
    authProvider.onRpcSuccess(() => this.handleAuthRpcSuccess())
    authProvider.onNotConnected(() => this.handleAuthNotConnected())
    authProvider.onIsConnected(({ preferredAccountType }) =>
      this.handleAuthIsConnected(preferredAccountType)
    )
    authProvider.onSetPreferredAccount(({ address, type }) => {
      if (address) {
        this.handleAuthSetPreferredAccount(address, type)
      }
    })
  }

  private handleAuthRpcRequest() {
    if (this.appKit?.isOpen()) {
      if (!this.appKit?.isTransactionStackEmpty()) {
        if (this.appKit?.isTransactionShouldReplaceView()) {
          this.appKit?.replace('ApproveTransaction')
        } else {
          this.appKit?.redirect('ApproveTransaction')
        }
      }
    } else {
      this.appKit?.open({ view: 'ApproveTransaction' })
    }
  }

  private handleInvalidAuthRequest(request: W3mFrameTypes.RPCRequest) {
    this.appKit?.open()
    console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, { method: request.method })
    setTimeout(() => {
      this.appKit?.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
    }, 300)
  }

  private handleAuthRpcError() {
    if (this.appKit?.isOpen()) {
      if (this.appKit?.isTransactionStackEmpty()) {
        this.appKit?.close()
      } else {
        this.appKit?.popTransactionStack(true)
      }
    }
  }

  private handleAuthRpcSuccess() {
    if (this.appKit?.isTransactionStackEmpty()) {
      this.appKit?.close()
    } else {
      this.appKit?.popTransactionStack(true)
    }
  }

  private handleAuthNotConnected() {
    this.appKit?.setIsConnected(false, this.chainNamespace)
    this.appKit?.setLoading(false)
  }

  private handleAuthIsConnected(preferredAccountType: string | undefined) {
    this.appKit?.setIsConnected(true, this.chainNamespace)
    this.appKit?.setLoading(false)
    this.appKit?.setPreferredAccountType(
      preferredAccountType as W3mFrameTypes.AccountType,
      this.chainNamespace
    )
  }

  private handleAuthSetPreferredAccount(address: string, type: string) {
    if (!address) {
      return
    }

    this.appKit?.setLoading(true)
    const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
    const caipNetwork = this.caipNetworks.find(c => c.chainId === chainId)
    // @ts-expect-error - address type will be checked todo(enes|sven)
    this.appKit?.setCaipAddress(address, this.chainNamespace)
    this.appKit?.setCaipNetwork(caipNetwork)
    this.appKit?.setStatus('connected', this.chainNamespace)
    this.appKit?.setIsConnected(true, this.chainNamespace)
    this.appKit?.setPreferredAccountType(type as W3mFrameTypes.AccountType, this.chainNamespace)
    this.syncAccount().then(() => this.appKit?.setLoading(false))
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

  private async syncAccount() {
    const isConnected = this.appKit?.getIsConnectedState()
    const address = this.appKit?.getAddress()
    const caipNetwork = this.appKit?.getCaipNetwork()
    const preferredAccountType = this.appKit?.getPreferredAccountType()
    this.appKit?.resetAccount(this.chainNamespace)

    if (isConnected && address && caipNetwork) {
      this.appKit?.setIsConnected(isConnected, this.chainNamespace)
      this.appKit?.setPreferredAccountType(preferredAccountType, this.chainNamespace)

      this.syncConnectedWalletInfo()

      if (caipNetwork?.explorerUrl) {
        this.appKit?.setAddressExplorerUrl(
          `${caipNetwork.explorerUrl}/address/${address}`,
          this.chainNamespace
        )
      }

      await Promise.all([
        this.syncProfile(address as Address),
        this.syncBalance(address as Address),
        this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
      this.appKit?.setAllAccounts([], this.chainNamespace)
    }
  }

  private async syncProfile(address: Address) {
    const caipNetwork = this.appKit?.getCaipNetwork()

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
      if (caipNetwork?.chainId === 1) {
        const ensProvider = new InfuraProvider('mainnet')
        const name = await ensProvider.lookupAddress(address)
        const avatar = await ensProvider.getAvatar(address)

        if (name) {
          this.appKit?.setProfileName(name, this.chainNamespace)
        } else {
          await this.syncWalletConnectName(address)
        }
        if (avatar) {
          this.appKit?.setProfileImage(avatar, this.chainNamespace)
        }
      } else {
        await this.syncWalletConnectName(address)
        this.appKit?.setProfileImage(null, this.chainNamespace)
      }
    }
  }

  private async syncBalance(address: Address) {
    const caipNetwork = this.appKit?.getCaipNetwork()

    if (caipNetwork) {
      if (caipNetwork) {
        const jsonRpcProvider = new JsonRpcProvider(caipNetwork.rpcUrl, {
          chainId: caipNetwork.chainId as number,
          name: caipNetwork.name
        })
        if (jsonRpcProvider) {
          const balance = await jsonRpcProvider.getBalance(address)
          const formattedBalance = formatEther(balance)

          this.appKit?.setBalance(formattedBalance, caipNetwork.currency, this.chainNamespace)
        }
      }
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = window?.localStorage.getItem(WcConstantsUtil.WALLET_ID)
    const providerType = EthersStoreUtil.state.providerId

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
      const provider = EthersStoreUtil.state.provider as unknown as UniversalProvider

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
    const requestSwitchNetwork = async (provider: Provider) => {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EthersHelpersUtil.numberToHexString(caipNetwork.chainId) }]
        })
        this.appKit?.setCaipNetwork(caipNetwork)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (switchError: any) {
        if (
          switchError.code === WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
          switchError.code === WcConstantsUtil.ERROR_CODE_DEFAULT ||
          switchError?.data?.originalError?.code ===
            WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
        ) {
          await EthersHelpersUtil.addEthereumChain(provider, caipNetwork)
        } else {
          throw new Error('Chain is not supported')
        }
      }
    }

    const provider = EthersStoreUtil.state.provider
    const providerType = EthersStoreUtil.state.providerId
    switch (providerType) {
      case ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID:
        this.appKit?.universalAdapter?.networkControllerClient.switchCaipNetwork(caipNetwork)
        break
      case ConstantsUtil.INJECTED_CONNECTOR_ID:
      case ConstantsUtil.EIP6963_CONNECTOR_ID:
      case ConstantsUtil.COINBASE_SDK_CONNECTOR_ID:
        if (provider) {
          await requestSwitchNetwork(provider)
        }
        break
      case ConstantsUtil.AUTH_CONNECTOR_ID:
        if (this.authProvider) {
          try {
            this.appKit?.setLoading(true)
            await this.authProvider.switchNetwork(caipNetwork.chainId as number)
            this.appKit?.setCaipNetwork(caipNetwork)

            const { address, preferredAccountType } = await this.authProvider.connect({
              chainId: caipNetwork.chainId as number | undefined
            })

            // @ts-expect-error - address type will be checked todo(enes|sven)
            this.appKit?.setCaipAddress(address, this.chainNamespace)
            this.appKit?.setPreferredAccountType(
              preferredAccountType as W3mFrameTypes.AccountType,
              this.chainNamespace
            )
            await this.syncAccount()
          } catch {
            throw new Error('Switching chain failed')
          } finally {
            this.appKit?.setLoading(false)
          }
        }
        break
      default:
        throw new Error('Unsupported provider type')
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = []

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
        chain: this.chainNamespace,
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

  private listenConnectors(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      const handler = this.eip6963EventHandler.bind(this)
      window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler)
      window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT))
    }
  }
}
