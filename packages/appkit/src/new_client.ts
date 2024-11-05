import {
  type EventsControllerState,
  type PublicStateControllerState,
  type ThemeControllerState,
  type ModalControllerState,
  type ConnectedWalletInfo,
  type RouterControllerState,
  type ChainAdapter,
  type SdkVersion,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  type Provider,
  type ConnectorType,
  ConstantsUtil as CoreConstantsUtil,
  type EstimateGasTransactionArgs,
  type SendTransactionArgs,
  type WriteContractArgs
} from '@reown/appkit-core'
import {
  AccountController,
  BlockchainApiController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  ChainController,
  PublicStateController,
  ThemeController,
  SnackController,
  RouterController,
  EnsController,
  OptionsController,
  NetworkController,
  AssetUtil,
  ApiController,
  StorageUtil
} from '@reown/appkit-core'
import { setColorTheme, setThemeVariables } from '@reown/appkit-ui'
import {
  ConstantsUtil,
  type CaipNetwork,
  type ChainNamespace,
  CaipNetworksUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipAddress,
  type CaipNetworkId
} from '@reown/appkit-common'
import type { AppKitOptions } from './utils/TypesUtil.js'
import { UniversalAdapter, UniversalAdapterClient } from './universal-adapter/client.js'
import { PresetsUtil } from '@reown/appkit-utils'
import {
  W3mFrameHelpers,
  W3mFrameRpcConstants,
  type W3mFrameProvider,
  type W3mFrameTypes
} from '@reown/appkit-wallet'
import { ProviderUtil } from './store/ProviderUtil.js'
import type { AdapterBlueprint } from './adapters/ChainAdapterBlueprint.js'
import UniversalProvider from '@walletconnect/universal-provider'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'
import { W3mFrameProviderSingleton } from './auth-provider/W3MFrameProviderSingleton.js'
import type { SessionTypes } from '@walletconnect/types'
import type { ConnectExternalOptions } from '../../core/dist/types/src/controllers/ConnectionController.js'
import type { ChainAdapterConnector } from './adapters/ChainAdapterConnector.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Export Controllers -------------------------------------------------------
export { AccountController, NetworkController }

// -- Types --------------------------------------------------------------------
export interface OpenOptions {
  view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

type Adapters = Record<ChainNamespace, AdapterBlueprint>

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit {
  private static instance?: AppKit

  public activeAdapter?: AdapterBlueprint

  public chainNamespaces: ChainNamespace[] = []

  public activeChainNamespace?: ChainNamespace

  public adapters?: ChainAdapter[]

  public chainAdapters?: Adapters

  public universalAdapter?: UniversalAdapterClient

  private universalProvider?: UniversalProvider

  private universalProviderInitPromise?: Promise<void>

  private authProvider?: W3mFrameProvider

  private initPromise?: Promise<void> = undefined

  private options?: AppKitOptions

  private connectionControllerClient?: ConnectionControllerClient

  private networkControllerClient?: NetworkControllerClient

  public constructor(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    this.options = options
    this.initialize(options)
  }

  public static getInstance() {
    return this.instance
  }

  private async initialize(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    this.extendCaipNetworks(options)
    this.createAuthProvider()
    await this.createUniversalProvider()
    this.createClients()
    this.initControllers(options)
    this.chainAdapters = await this.createAdapters(
      options.adapters as unknown as AdapterBlueprint[]
    )
    await this.initChainAdapters()

    this.syncRequestedNetworks()
    await this.initOrContinue()
    await this.syncExistingConnection()
  }

  // -- Public -------------------------------------------------------------------
  public async open(options?: OpenOptions) {
    await this.initOrContinue()
    ModalController.open(options)
  }

  public async close() {
    await this.initOrContinue()
    ModalController.close()
  }

  public setLoading(loading: ModalControllerState['loading']) {
    ModalController.setLoading(loading)
  }

  // -- Adapter Methods ----------------------------------------------------------
  public getError() {
    return ''
  }

  public getChainId() {
    return ChainController.state.activeCaipNetwork?.chainId
  }

  public switchNetwork(caipNetwork: CaipNetwork) {
    return NetworkController.switchActiveNetwork(caipNetwork)
  }

  public getIsConnected() {
    return AccountController.state.isConnected
  }

  public getWalletProvider() {
    return ChainController.state.activeChain
      ? ProviderUtil.state.providers[ChainController.state.activeChain]
      : null
  }

  public getWalletProviderType() {
    return ChainController.state.activeChain
      ? ProviderUtil.state.providerIds[ChainController.state.activeChain]
      : null
  }

  public subscribeProvider() {
    return null
  }

  public getThemeMode() {
    return ThemeController.state.themeMode
  }

  public getThemeVariables() {
    return ThemeController.state.themeVariables
  }

  public setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    ThemeController.setThemeMode(themeMode)
    setColorTheme(ThemeController.state.themeMode)
  }

  public setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    ThemeController.setThemeVariables(themeVariables)
    setThemeVariables(ThemeController.state.themeVariables)
  }

  public subscribeTheme(callback: (newState: ThemeControllerState) => void) {
    return ThemeController.subscribe(callback)
  }

  public getWalletInfo() {
    return AccountController.state.connectedWalletInfo
  }

  public subscribeWalletInfo(callback: (newState: ConnectedWalletInfo) => void) {
    return AccountController.subscribeKey('connectedWalletInfo', callback)
  }

  public subscribeShouldUpdateToAddress(callback: (newState?: string) => void) {
    AccountController.subscribeKey('shouldUpdateToAddress', callback)
  }

  public subscribeCaipNetworkChange(callback: (newState?: CaipNetwork) => void) {
    NetworkController.subscribeKey('caipNetwork', callback)
  }

  public getState() {
    return PublicStateController.state
  }

  public subscribeState(callback: (newState: PublicStateControllerState) => void) {
    return PublicStateController.subscribe(callback)
  }

  public showErrorMessage(message: string) {
    SnackController.showError(message)
  }

  public showSuccessMessage(message: string) {
    SnackController.showSuccess(message)
  }

  public getEvent() {
    return { ...EventsController.state }
  }

  public subscribeEvents(callback: (newEvent: EventsControllerState) => void) {
    return EventsController.subscribe(callback)
  }

  public replace(route: RouterControllerState['view']) {
    RouterController.replace(route)
  }

  public redirect(route: RouterControllerState['view']) {
    RouterController.push(route)
  }

  public popTransactionStack(cancel?: boolean) {
    RouterController.popTransactionStack(cancel)
  }

  public isOpen() {
    return ModalController.state.open
  }

  public isTransactionStackEmpty() {
    return RouterController.state.transactionStack.length === 0
  }

  public isTransactionShouldReplaceView() {
    return RouterController.state.transactionStack[
      RouterController.state.transactionStack.length - 1
    ]?.replace
  }

  public setIsConnected: (typeof AccountController)['setIsConnected'] = (isConnected, chain) => {
    AccountController.setIsConnected(isConnected, chain)
  }

  public setStatus: (typeof AccountController)['setStatus'] = (status, chain) => {
    AccountController.setStatus(status, chain)
  }

  public getIsConnectedState = () => AccountController.state.isConnected

  public setAllAccounts: (typeof AccountController)['setAllAccounts'] = (addresses, chain) => {
    AccountController.setAllAccounts(addresses, chain)
    OptionsController.setHasMultipleAddresses(addresses?.length > 1)
  }

  public addAddressLabel: (typeof AccountController)['addAddressLabel'] = (
    address,
    label,
    chain
  ) => {
    AccountController.addAddressLabel(address, label, chain)
  }

  public removeAddressLabel: (typeof AccountController)['removeAddressLabel'] = (
    address,
    chain
  ) => {
    AccountController.removeAddressLabel(address, chain)
  }

  public getCaipAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return ChainController.state.activeCaipAddress
    }

    return ChainController.getAccountProp('caipAddress', chainNamespace)
  }

  public getAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return AccountController.state.address
    }

    return ChainController.getAccountProp('address', chainNamespace)
  }

  public getProvider = () => AccountController.state.provider

  public getPreferredAccountType = () =>
    AccountController.state.preferredAccountType as W3mFrameTypes.AccountType

  public setCaipAddress: (typeof AccountController)['setCaipAddress'] = (caipAddress, chain) => {
    AccountController.setCaipAddress(caipAddress, chain)
  }

  public setProvider: (typeof AccountController)['setProvider'] = (provider, chain) => {
    AccountController.setProvider(provider, chain)
  }

  public setBalance: (typeof AccountController)['setBalance'] = (balance, balanceSymbol, chain) => {
    AccountController.setBalance(balance, balanceSymbol, chain)
  }

  public setProfileName: (typeof AccountController)['setProfileName'] = (profileName, chain) => {
    AccountController.setProfileName(profileName, chain)
  }

  public setProfileImage: (typeof AccountController)['setProfileImage'] = (profileImage, chain) => {
    AccountController.setProfileImage(profileImage, chain)
  }

  public resetAccount: (typeof AccountController)['resetAccount'] = (chain: ChainNamespace) => {
    SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_ID)
    SafeLocalStorage.removeItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR)
    AccountController.resetAccount(chain)
  }

  public setCaipNetwork: (typeof NetworkController)['setCaipNetwork'] = caipNetwork => {
    ChainController.setActiveCaipNetwork(caipNetwork)
  }

  public getCaipNetwork = (chainNamespace?: ChainNamespace) => {
    if (chainNamespace) {
      return NetworkController.getRequestedCaipNetworks().filter(
        c => c.chainNamespace === chainNamespace
      )?.[0]
    }

    return ChainController.state.activeCaipNetwork
  }

  public getCaipNetworks = () => NetworkController.getRequestedCaipNetworks()

  public getActiveChainNamespace = () => ChainController.state.activeChain

  public setRequestedCaipNetworks: (typeof NetworkController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    chain: ChainNamespace
  ) => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
  }

  public getApprovedCaipNetworkIds: (typeof NetworkController)['getApprovedCaipNetworkIds'] = () =>
    NetworkController.getApprovedCaipNetworkIds()

  public setApprovedCaipNetworksData: (typeof NetworkController)['setApprovedCaipNetworksData'] =
    chain => NetworkController.setApprovedCaipNetworksData(chain)

  public resetNetwork: (typeof NetworkController)['resetNetwork'] = () => {
    NetworkController.resetNetwork()
  }

  public setConnectors: (typeof ConnectorController)['setConnectors'] = connectors => {
    const allConnectors = [...ConnectorController.getConnectors(), ...connectors]
    ConnectorController.setConnectors(allConnectors)
  }

  public addConnector: (typeof ConnectorController)['addConnector'] = connector => {
    ConnectorController.addConnector(connector)
  }

  public getConnectors: (typeof ConnectorController)['getConnectors'] = () =>
    ConnectorController.getConnectors()

  public resetWcConnection: (typeof ConnectionController)['resetWcConnection'] = () => {
    ConnectionController.resetWcConnection()
  }

  public fetchIdentity: (typeof BlockchainApiController)['fetchIdentity'] = request =>
    BlockchainApiController.fetchIdentity(request)

  public setAddressExplorerUrl: (typeof AccountController)['setAddressExplorerUrl'] = (
    addressExplorerUrl,
    chain
  ) => {
    AccountController.setAddressExplorerUrl(addressExplorerUrl, chain)
  }

  public setSmartAccountDeployed: (typeof AccountController)['setSmartAccountDeployed'] = (
    isDeployed,
    chain
  ) => {
    AccountController.setSmartAccountDeployed(isDeployed, chain)
  }

  public setConnectedWalletInfo: (typeof AccountController)['setConnectedWalletInfo'] = (
    connectedWalletInfo,
    chain
  ) => {
    AccountController.setConnectedWalletInfo(connectedWalletInfo, chain)
  }

  public setSmartAccountEnabledNetworks: (typeof NetworkController)['setSmartAccountEnabledNetworks'] =
    (smartAccountEnabledNetworks, chain) => {
      NetworkController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
    }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] = (
    preferredAccountType,
    chain
  ) => {
    AccountController.setPreferredAccountType(preferredAccountType, chain)
  }

  public getReownName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

  public resolveReownName = async (name: string) => {
    const wcNameAddress = await EnsController.resolveName(name)
    const networkNameAddresses = Object.values(wcNameAddress?.addresses) || []

    return networkNameAddresses[0]?.address || false
  }

  public setEIP6963Enabled: (typeof OptionsController)['setEIP6963Enabled'] = enabled => {
    OptionsController.setEIP6963Enabled(enabled)
  }

  public setClientId: (typeof BlockchainApiController)['setClientId'] = clientId => {
    BlockchainApiController.setClientId(clientId)
  }

  public getConnectorImage: (typeof AssetUtil)['getConnectorImage'] = connector =>
    AssetUtil.getConnectorImage(connector)

  public handleUnsafeRPCRequest = () => {
    if (this.isOpen()) {
      // If we are on the modal but there is no transaction stack, close the modal
      if (this.isTransactionStackEmpty()) {
        return
      }

      // Check if we need to replace or redirect
      this.redirect('ApproveTransaction')
    } else {
      // If called from outside the modal, open ApproveTransaction
      this.open({ view: 'ApproveTransaction' })
    }
  }

  // -- Private ------------------------------------------------------------------
  private async initControllers(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    OptionsController.setProjectId(options.projectId)
    OptionsController.setSdkVersion(options.sdkVersion)

    this.adapters = options.adapters
    const evmAdapter = options.adapters?.find(
      adapter => adapter.chainNamespace === ConstantsUtil.CHAIN.EVM
    )

    this.setMetadata(options)

    this.setDefaultNetwork(options)

    OptionsController.setAllWallets(options.allWallets)
    OptionsController.setIncludeWalletIds(options.includeWalletIds)
    OptionsController.setExcludeWalletIds(options.excludeWalletIds)
    if (options.excludeWalletIds) {
      ApiController.searchWalletByIds({ ids: options.excludeWalletIds })
    }
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds)
    OptionsController.setTokens(options.tokens)
    OptionsController.setTermsConditionsUrl(options.termsConditionsUrl)
    OptionsController.setPrivacyPolicyUrl(options.privacyPolicyUrl)
    OptionsController.setCustomWallets(options.customWallets)
    OptionsController.setFeatures(options.features)
    OptionsController.setEnableWalletConnect(options.enableWalletConnect !== false)
    OptionsController.setEnableWallets(options.enableWallets !== false)
    OptionsController.setEIP6963Enabled(options.enableEIP6963 !== false)

    if (options.metadata) {
      OptionsController.setMetadata(options.metadata)
    }

    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }

    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }

    if (options.disableAppend) {
      OptionsController.setDisableAppend(Boolean(options.disableAppend))
    }

    ChainController.setActiveCaipNetwork(options.defaultNetwork || this.options?.networks[0])

    // Set the SIWE client for EVM chains
    if (evmAdapter) {
      if (options.siweConfig) {
        const { SIWEController } = await import('@reown/appkit-siwe')
        SIWEController.setSIWEClient(options.siweConfig)
      }
    }
  }

  private setMetadata(options: AppKitOptions) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    options.metadata = {
      name: document.getElementsByTagName('title')[0]?.textContent || '',
      description:
        document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content || '',
      url: window.location.origin,
      icons: [document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href || '']
    }
  }

  private extendCaipNetworks(options: AppKitOptions) {
    options.networks = CaipNetworksUtil.extendCaipNetworks(options.networks, {
      networkImageIds: PresetsUtil.NetworkImageIds,
      customNetworkImageUrls: options.chainImages,
      projectId: options.projectId
    })
    options.defaultNetwork = options.networks.find(n => n.id === options.defaultNetwork?.id)
    this.options = options
  }

  private setDefaultNetwork(options: AppKitOptions) {
    const extendedDefaultNetwork = options.defaultNetwork
      ? CaipNetworksUtil.extendCaipNetwork(options.defaultNetwork, {
          networkImageIds: PresetsUtil.NetworkImageIds,
          customNetworkImageUrls: options.chainImages,
          projectId: options.projectId
        })
      : undefined
    const previousNetwork = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
    const caipNetwork = previousNetwork
      ? options.networks.find(n => n.id === previousNetwork)
      : undefined

    const network = caipNetwork ?? extendedDefaultNetwork ?? options.networks[0]
    ChainController.setActiveCaipNetwork(network)
  }

  private createClients() {
    this.connectionControllerClient = {
      connectWalletConnect: async (onUri: (uri: string) => void) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        await adapter?.connectWalletConnect(onUri, this.getCaipNetwork()?.chainId)

        this.syncWalletConnectAccount()
      },
      connectExternal: async ({ id, info, type, provider, chainId }: ConnectExternalOptions) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        const res = await adapter?.connect({
          id,
          info,
          type,
          provider,
          chainId,
          rpcUrl: this.getCaipNetwork()?.rpcUrl
        })

        if (res) {
          await this.syncAccount(res)
          this.syncProvider(res)
        }
      },
      disconnect: async () => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const provider = ProviderUtil.getProvider<UniversalProvider | Provider | W3mFrameProvider>(
          ChainController.state.activeChain as ChainNamespace
        )
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

        await adapter?.disconnect({ provider, providerType })

        ChainController.state.chains.forEach(chain => {
          this.resetAccount(chain.chainNamespace)
        })
      },
      checkInstalled: (ids?: string[]) => {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },
      signMessage: async (message: string) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.signMessage({
          message,
          address: AccountController.state.address as string,
          provider: ProviderUtil.getProvider(ChainController.state.activeChain as ChainNamespace)
        })

        return result?.signature || ''
      },
      sendTransaction: async (args: SendTransactionArgs) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.sendTransaction(args)

        return result?.hash || ''
      },
      estimateGas: async (args: EstimateGasTransactionArgs) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const provider = ProviderUtil.getProvider(
          ChainController.state.activeChain as ChainNamespace
        )
        const caipNetwork = this.getCaipNetwork()
        if (!caipNetwork) {
          throw new Error('CaipNetwork is undefined')
        }

        const result = await adapter?.estimateGas({
          ...args,
          provider,
          caipNetwork
        })

        return result?.gas || 0n
      },
      getEnsAvatar: async () => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.getProfile({
          address: AccountController.state.address as string,
          chainId: Number(this.getCaipNetwork()?.chainId)
        })

        return result?.profileImage || false
      },
      getEnsAddress: async (name: string) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const caipNetwork = this.getCaipNetwork()
        if (!caipNetwork) {
          return false
        }
        const result = await adapter?.getEnsAddress({
          name,
          caipNetwork,
          appKit: this
        })

        return result?.address || false
      },
      writeContract: async (args: WriteContractArgs) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const caipNetwork = this.getCaipNetwork()
        const caipAddress = this.getCaipAddress()
        const provider = ProviderUtil.getProvider(
          ChainController.state.activeChain as ChainNamespace
        )
        if (!caipNetwork || !caipAddress) {
          throw new Error('CaipNetwork or CaipAddress is undefined')
        }
        const result = await adapter?.writeContract({ ...args, caipNetwork, provider, caipAddress })

        return result?.hash as `0x${string}` | null
      },
      parseUnits: (value: string, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return adapter?.parseUnits({ value, decimals }) ?? 0n
      },
      formatUnits: (value: bigint, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return adapter?.formatUnits({ value, decimals }) ?? '0'
      }
    }

    ConnectionController.setClient(this.connectionControllerClient)

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (!caipNetwork) {
          return
        }

        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const provider = ProviderUtil.getProvider<UniversalProvider | Provider | W3mFrameProvider>(
          ChainController.state.activeChain as ChainNamespace
        )
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]
        await adapter?.switchNetwork({ caipNetwork, provider, providerType })
        await this.syncAccount({
          address: AccountController.state.address as string,
          chainId: Number(ChainController.state.activeCaipNetwork?.chainId)
        })
      },
      getApprovedCaipNetworksData: async () => {
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

        if (providerType === 'WALLET_CONNECT') {
          const namespaces = this.universalProvider?.session?.namespaces

          return {
            supportsAllNetworks: false,
            approvedCaipNetworkIds: this.getChainsFromNamespaces(namespaces)
          }
        }

        return { supportsAllNetworks: true, approvedCaipNetworkIds: [] }
      }
    }
    NetworkController.setClient(this.networkControllerClient)
  }

  private async handleDisconnect() {
    await this.connectionControllerClient?.disconnect()
  }

  private async listenAuthConnector(provider: W3mFrameProvider) {
    this.setLoading(true)
    const isLoginEmailUsed = provider.getLoginEmailUsed()
    this.setLoading(isLoginEmailUsed)
    const { isConnected } = await provider.isConnected()
    if (isConnected && this.connectionControllerClient?.connectExternal) {
      this.connectionControllerClient?.connectExternal({
        id: 'w3mAuth',
        info: {
          name: 'w3mAuth'
        },
        type: 'AUTH',
        provider,
        chainId: ChainController.state.activeCaipNetwork?.chainId
      })
    } else {
      this.setLoading(false)
    }

    provider.onRpcRequest((request: W3mFrameTypes.RPCRequest) => {
      if (W3mFrameHelpers.checkIfRequestExists(request)) {
        if (!W3mFrameHelpers.checkIfRequestIsSafe(request)) {
          this.handleUnsafeRPCRequest()
        }
      } else {
        this.open()
        // eslint-disable-next-line no-console
        console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
          method: request.method
        })
        setTimeout(() => {
          this.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
        }, 300)
        provider.rejectRpcRequests()
      }
    })

    provider.onRpcError(() => {
      const isModalOpen = this.isOpen()

      if (isModalOpen) {
        if (this.isTransactionStackEmpty()) {
          this.close()
        } else {
          this.popTransactionStack(true)
        }
      }
    })

    provider.onRpcSuccess((_, request) => {
      const isSafeRequest = W3mFrameHelpers.checkIfRequestIsSafe(request)
      if (isSafeRequest) {
        return
      }

      if (this.isTransactionStackEmpty()) {
        this.close()
      } else {
        this.popTransactionStack()
      }
    })

    provider.onNotConnected(() => {
      const connectedConnector = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR)
      const isConnectedWithAuth = connectedConnector === 'w3mAuth'

      if (!isConnected && isConnectedWithAuth) {
        this.setCaipAddress(undefined, ChainController.state.activeChain as ChainNamespace)
        this.setLoading(false)
      }
    })

    provider.onIsConnected(() => {
      provider.connect()
    })

    provider.onConnect(user => {
      const caipAddress = `eip155:${user.chainId}:${user.address}` as CaipAddress
      this.setCaipAddress(caipAddress, ChainController.state.activeChain as ChainNamespace)
      this.setSmartAccountDeployed(
        Boolean(user.smartAccountDeployed),
        ChainController.state.activeChain as ChainNamespace
      )
      this.setPreferredAccountType(
        user.preferredAccountType as W3mFrameTypes.AccountType,
        ChainController.state.activeChain as ChainNamespace
      )
      this.setAllAccounts(
        user.accounts || [
          {
            address: user.address,
            type: (user.preferredAccountType || 'eoa') as W3mFrameTypes.AccountType
          }
        ],
        ChainController.state.activeChain as ChainNamespace
      )
      this.setLoading(false)
    })

    provider.onGetSmartAccountEnabledNetworks(networks => {
      this.setSmartAccountEnabledNetworks(
        networks,
        ChainController.state.activeChain as ChainNamespace
      )
    })

    provider.onSetPreferredAccount(({ address, type }) => {
      if (!address) {
        return
      }
      this.setPreferredAccountType(
        type as W3mFrameTypes.AccountType,
        ChainController.state.activeChain as ChainNamespace
      )
    })
  }
  private listenAdapter(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    adapter?.on('switchNetwork', ({ address, chainId }) => {
      if (ChainController.state.activeChain === chainNamespace && address) {
        this.syncAccount({ address, chainId: Number(chainId) })
      } else if (
        ChainController.state.activeChain === chainNamespace &&
        AccountController.state.address
      ) {
        this.syncAccount({ address: AccountController.state.address, chainId: Number(chainId) })
      }
    })

    adapter?.on('disconnect', () => {
      if (ChainController.state.activeChain === chainNamespace) {
        this.handleDisconnect()
      }
    })

    adapter?.on('accountChanged', ({ address, chainId }) => {
      if (ChainController.state.activeChain === chainNamespace && chainId) {
        this.syncAccount({ address, chainId: Number(chainId) })
      } else if (
        ChainController.state.activeChain === chainNamespace &&
        ChainController.state.activeCaipNetwork?.chainId
      ) {
        this.syncAccount({
          address,
          chainId: Number(ChainController.state.activeCaipNetwork.chainId)
        })
      }
    })
  }

  private getChainsFromNamespaces(namespaces: SessionTypes.Namespaces = {}): CaipNetworkId[] {
    return Object.values(namespaces).flatMap<CaipNetworkId>(namespace => {
      const chains = (namespace.chains || []) as CaipNetworkId[]
      const accountsChains = namespace.accounts.map(account => {
        const [chainNamespace, chainId] = account.split(':')

        return `${chainNamespace}:${chainId}` as CaipNetworkId
      })

      return Array.from(new Set([...chains, ...accountsChains]))
    })
  }

  private syncWalletConnectAccount() {
    this.chainNamespaces.forEach(async chainNamespace => {
      const caipAddress = this.universalProvider?.session?.namespaces?.[chainNamespace]
        ?.accounts[0] as CaipAddress

      ProviderUtil.setProviderId(chainNamespace, 'WALLET_CONNECT')
      ProviderUtil.setProvider(chainNamespace, this.universalProvider)
      StorageUtil.setConnectedConnector('WALLET_CONNECT')
      StorageUtil.setConnectedNamespace(chainNamespace)
      let address = ''
      if (caipAddress.split(':').length === 3) {
        address = caipAddress.split(':')[2] as string
      } else {
        address = AccountController.state.address as string
      }
      await this.syncAccount({
        address,
        chainId: Number(ChainController.state.activeCaipNetwork?.chainId)
      })
    })
  }

  private syncProvider({
    type,
    provider,
    id
  }: Pick<AdapterBlueprint.ConnectResult, 'type' | 'provider' | 'id'>) {
    ProviderUtil.setProviderId(ChainController.state.activeChain as ChainNamespace, type)
    ProviderUtil.setProvider(ChainController.state.activeChain as ChainNamespace, provider)

    StorageUtil.setConnectedConnector(id as ConnectorType)
    StorageUtil.setConnectedNamespace(ChainController.state.activeChain as ChainNamespace)
  }

  private async syncAccount({
    address,
    chainId
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'>) {
    this.setPreferredAccountType(
      AccountController.state.preferredAccountType
        ? AccountController.state.preferredAccountType
        : 'eoa',
      ChainController.state.activeChain as ChainNamespace
    )
    this.setCaipAddress(
      `${ChainController.state.activeChain}:${chainId}:${address}` as `${ChainNamespace}:${string}:${string}`,
      ChainController.state.activeChain as ChainNamespace
    )

    const caipNetwork = this.options?.networks.find(
      n => n.chainId === chainId && n.chainNamespace === ChainController.state.activeChain
    )
    if (caipNetwork) {
      this.setCaipNetwork(caipNetwork)
    }

    const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
    const balance = await adapter?.getBalance({
      address,
      chainId,
      caipNetwork: this.getCaipNetwork()
    })
    if (balance) {
      this.setBalance(
        balance.balance,
        balance.symbol,
        ChainController.state.activeChain as ChainNamespace
      )
    }
    await this.syncIdentity({ address, chainId: Number(chainId) })
  }

  private async syncIdentity({
    address,
    chainId
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'>) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        address
      })

      this.setProfileName(name, ChainController.state.activeChain as ChainNamespace)
      this.setProfileImage(avatar, ChainController.state.activeChain as ChainNamespace)

      if (!name) {
        await this.syncReownName(address)
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.getProfile({ address, chainId: Number(chainId) })

        if (result?.profileName) {
          this.setProfileName(
            result.profileName,
            ChainController.state.activeChain as ChainNamespace
          )
          if (result.profileImage) {
            this.setProfileImage(
              result.profileImage,
              ChainController.state.activeChain as ChainNamespace
            )
          }
        } else {
          await this.syncReownName(address)
          this.setProfileImage(null, ChainController.state.activeChain as ChainNamespace)
        }
      }
    } catch {
      if (chainId === 1) {
        await this.syncReownName(address)
      } else {
        await this.syncReownName(address)
        this.setProfileImage(null, ChainController.state.activeChain as ChainNamespace)
      }
    }
  }

  private async syncReownName(address: string) {
    try {
      const registeredWcNames = await this.getReownName(address)
      if (registeredWcNames[0]) {
        const wcName = registeredWcNames[0]
        this.setProfileName(wcName.name, ChainController.state.activeChain as ChainNamespace)
      } else {
        this.setProfileName(null, ChainController.state.activeChain as ChainNamespace)
      }
    } catch {
      this.setProfileName(null, ChainController.state.activeChain as ChainNamespace)
    }
  }

  private async initOrContinue() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([
          import('@reown/appkit-ui'),
          import('@reown/appkit-scaffold-ui/w3m-modal')
        ])
        const modal = document.createElement('w3m-modal')
        if (!OptionsController.state.disableAppend) {
          document.body.insertAdjacentElement('beforeend', modal)
        }
        resolve()
      })
    }

    return this.initPromise
  }

  private syncRequestedNetworks() {
    const uniqueChainNamespaces = [
      ...new Set(this.options?.networks.map(caipNetwork => caipNetwork.chainNamespace))
    ]
    this.chainNamespaces = uniqueChainNamespaces

    uniqueChainNamespaces.forEach(chainNamespace => {
      this.setRequestedCaipNetworks(
        this.options?.networks.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace),
        chainNamespace
      )
    })
  }

  private async syncExistingConnection() {
    const connectedConnector = SafeLocalStorage.getItem(
      SafeLocalStorageKeys.CONNECTED_CONNECTOR
    ) as ConnectorType
    const connectedNamespace = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_NAMESPACE)

    if (connectedConnector === 'WALLET_CONNECT' && connectedNamespace) {
      this.syncWalletConnectAccount()
    } else if (connectedConnector && connectedConnector !== 'w3mAuth' && connectedNamespace) {
      const adapter = this.getAdapter(connectedNamespace as ChainNamespace)
      const res = await adapter?.syncConnection(
        connectedConnector,
        connectedNamespace,
        this.getCaipNetwork()?.rpcUrl
      )

      if (res) {
        this.syncProvider(res)
        await this.syncAccount(res)
      }
    }
  }

  private getAdapter(namespace: ChainNamespace) {
    return this.chainAdapters?.[namespace]
  }

  private createUniversalProvider() {
    if (
      !this.universalProviderInitPromise &&
      typeof window !== 'undefined' &&
      this.options?.projectId
    ) {
      this.universalProviderInitPromise = this.initUniversalProvider()
    }

    return this.universalProviderInitPromise
  }

  private async initUniversalProvider() {
    const universalProviderOptions: UniversalProviderOpts = {
      projectId: this.options?.projectId,
      metadata: {
        name: this.options?.metadata ? this.options?.metadata.name : '',
        description: this.options?.metadata ? this.options?.metadata.description : '',
        url: this.options?.metadata ? this.options?.metadata.url : '',
        icons: this.options?.metadata ? this.options?.metadata.icons : ['']
      }
    }

    this.universalProvider = await UniversalProvider.init(universalProviderOptions)
  }

  public async getUniversalProvider() {
    if (!this.universalProvider) {
      try {
        await this.createUniversalProvider()
      } catch (error) {
        throw new Error('AppKit:getUniversalProvider - Cannot create provider')
      }
    }

    return this.universalProvider
  }

  private createAuthProvider() {
    const emailEnabled =
      this.options?.features?.email === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.email
        : this.options?.features?.email
    const socialsEnabled = this.options?.features?.socials
      ? this.options?.features?.socials?.length > 0
      : CoreConstantsUtil.DEFAULT_FEATURES.socials
    if (this.options?.projectId && (emailEnabled || socialsEnabled)) {
      this.authProvider = W3mFrameProviderSingleton.getInstance(this.options?.projectId)
      this.listenAuthConnector(this.authProvider)
    }
  }

  private async createAdapters(blueprints?: AdapterBlueprint[]): Promise<Adapters> {
    if (!this.universalProvider) {
      this.universalProvider = await this.getUniversalProvider()
    }

    this.syncRequestedNetworks()

    return this.chainNamespaces.reduce<Adapters>((adapters, namespace) => {
      const blueprint = blueprints?.find(b => b.namespace === namespace)

      if (blueprint) {
        adapters[namespace] = blueprint
        adapters[namespace].namespace = namespace
        adapters[namespace].construct({
          namespace,
          projectId: this.options?.projectId,
          networks: this.options?.networks
        })
        if (this.universalProvider) {
          adapters[namespace].setUniversalProvider(this.universalProvider)
        }
        if (this.authProvider) {
          adapters[namespace].setAuthProvider(this.authProvider)
        }
        if (this.options?.features) {
          adapters[namespace].syncConnectors(this.options, this)
        }
      } else {
        adapters[namespace] = new UniversalAdapter({
          namespace,
          networks: this.options?.networks
        })
        if (this.universalProvider) {
          adapters[namespace].setUniversalProvider(this.universalProvider)
        }
        if (this.authProvider) {
          adapters[namespace].setAuthProvider(this.authProvider)
        }
      }

      ChainController.state.chains.set(namespace, {
        chainNamespace: namespace,
        connectionControllerClient: this.connectionControllerClient,
        networkControllerClient: this.networkControllerClient,
        accountState: AccountController.state,
        networkState: NetworkController.state,
        caipNetworks: this.options?.networks || []
      })

      return adapters
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, {} as Adapters)
  }

  private async initChainAdapters() {
    await Promise.all(
      this.chainNamespaces.map(async namespace => {
        if (this.options) {
          this.listenAdapter(namespace)

          this.setConnectors(this.chainAdapters?.[namespace]?.connectors || [])
        }
      })
    )
  }
}
