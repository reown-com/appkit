/* eslint-disable max-depth */
import {
  type EventsControllerState,
  type PublicStateControllerState,
  type ThemeControllerState,
  type ModalControllerState,
  type ConnectedWalletInfo,
  type RouterControllerState,
  type ChainAdapter,
  type SdkVersion,
  type UseAppKitAccountReturn,
  type UseAppKitNetworkReturn,
  type NetworkControllerClient,
  type ConnectionControllerClient,
  ConstantsUtil as CoreConstantsUtil,
  type ConnectorType,
  type WriteContractArgs,
  type Provider,
  type SendTransactionArgs,
  type EstimateGasTransactionArgs,
  type AccountControllerState,
  type AdapterNetworkState,
  SIWXUtil
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
  AssetUtil,
  ApiController,
  AlertController,
  StorageUtil
} from '@reown/appkit-core'
import { setColorTheme, setThemeVariables } from '@reown/appkit-ui-new'
import {
  ConstantsUtil,
  type CaipNetwork,
  type ChainNamespace,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipAddress,
  type CaipNetworkId
} from '@reown/appkit-common'
import type { AppKitOptions } from './utils/TypesUtil.js'
import {
  UniversalAdapter,
  UniversalAdapter as UniversalAdapterClient
} from './universal-adapter/client.js'
import {
  CaipNetworksUtil,
  ErrorUtil,
  ConstantsUtil as UtilConstantsUtil
} from '@reown/appkit-utils'
import {
  W3mFrameHelpers,
  W3mFrameRpcConstants,
  type W3mFrameProvider,
  type W3mFrameTypes
} from '@reown/appkit-wallet'
import { ProviderUtil } from './store/ProviderUtil.js'
import type { AppKitNetwork } from '@reown/appkit-new/networks'
import type { AdapterBlueprint } from './adapters/ChainAdapterBlueprint.js'
import UniversalProvider from '@walletconnect/universal-provider'
import type { SessionTypes } from '@walletconnect/types'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'
import { W3mFrameProviderSingleton } from './auth-provider/W3MFrameProviderSingleton.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Export Controllers -------------------------------------------------------
export { AccountController }

// -- Types --------------------------------------------------------------------
export interface OpenOptions {
  view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

type Adapters = Record<ChainNamespace, AdapterBlueprint>

// -- Constants ----------------------------------------- //
const accountState: AccountControllerState = {
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
}

const networkState: AdapterNetworkState = {
  supportsAllNetworks: true,
  smartAccountEnabledNetworks: []
}

const OPTIONAL_METHODS = [
  'eth_accounts',
  'eth_requestAccounts',
  'eth_sendRawTransaction',
  'eth_sign',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'personal_sign',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_registerOnboarding',
  'wallet_watchAsset',
  'wallet_scanQRCode',
  // EIP-5792
  'wallet_getCallsStatus',
  'wallet_sendCalls',
  'wallet_getCapabilities',
  // EIP-7715
  'wallet_grantPermissions',
  'wallet_revokePermissions'
]

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit {
  private static instance?: AppKit

  public activeAdapter?: AdapterBlueprint

  public options: AppKitOptions

  public adapters?: ChainAdapter[]

  public activeChainNamespace?: ChainNamespace

  public chainNamespaces: ChainNamespace[] = []

  public chainAdapters?: Adapters

  public universalAdapter?: UniversalAdapterClient

  private universalProvider?: UniversalProvider

  private connectionControllerClient?: ConnectionControllerClient

  private networkControllerClient?: NetworkControllerClient

  private universalProviderInitPromise?: Promise<void>

  private authProvider?: W3mFrameProvider

  private initPromise?: Promise<void> = undefined

  public version?: SdkVersion

  public adapter?: ChainAdapter

  private caipNetworks?: [CaipNetwork, ...CaipNetwork[]]

  private defaultCaipNetwork?: CaipNetwork

  public constructor(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
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
    this.caipNetworks = this.extendCaipNetworks(options)
    this.defaultCaipNetwork = this.extendDefaultCaipNetwork(options)
    await this.initControllers(options)
    this.createAuthProvider()
    await this.createUniversalProvider()
    this.createClients()
    ChainController.initialize(options.adapters ?? [])
    this.chainAdapters = await this.createAdapters(
      options.adapters as unknown as AdapterBlueprint[]
    )
    await this.initChainAdapters()
    this.syncRequestedNetworks()
    await this.initOrContinue()
    await this.syncExistingConnection()
    this.version = options.sdkVersion
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
    return ChainController.state.activeCaipNetwork?.id
  }

  public switchNetwork(appKitNetwork: AppKitNetwork) {
    const network = this.caipNetworks?.find(n => n.id === appKitNetwork.id)

    if (!network) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.SWITCH_NETWORK_NOT_FOUND, 'error')

      return
    }

    ChainController.switchActiveNetwork(network)
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

  public subscribeAccount(callback: (newState: UseAppKitAccountReturn) => void) {
    function updateVal() {
      callback({
        caipAddress: ChainController.state.activeCaipAddress,
        address: CoreHelperUtil.getPlainAddress(ChainController.state.activeCaipAddress),
        isConnected: Boolean(ChainController.state.activeCaipAddress),
        status: AccountController.state.status
      })
    }

    ChainController.subscribe(updateVal)
    AccountController.subscribe(updateVal)
  }

  public subscribeNetwork(
    callback: (newState: Omit<UseAppKitNetworkReturn, 'switchNetwork'>) => void
  ) {
    return ChainController.subscribe(({ activeCaipNetwork }) => {
      callback({
        caipNetwork: activeCaipNetwork,
        chainId: activeCaipNetwork?.id,
        caipNetworkId: activeCaipNetwork?.caipNetworkId
      })
    })
  }

  public subscribeWalletInfo(callback: (newState: ConnectedWalletInfo) => void) {
    return AccountController.subscribeKey('connectedWalletInfo', callback)
  }

  public subscribeShouldUpdateToAddress(callback: (newState?: string) => void) {
    AccountController.subscribeKey('shouldUpdateToAddress', callback)
  }

  public subscribeCaipNetworkChange(callback: (newState?: CaipNetwork) => void) {
    ChainController.subscribeKey('activeCaipNetwork', callback)
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

  public setStatus: (typeof AccountController)['setStatus'] = (status, chain) => {
    AccountController.setStatus(status, chain)
  }

  public getIsConnectedState = () => Boolean(ChainController.state.activeCaipAddress)

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

  public getAddressByChainNamespace = (chainNamespace: ChainNamespace) =>
    ChainController.getAccountProp('address', chainNamespace)

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
    AccountController.resetAccount(chain)
  }

  public setCaipNetwork: (typeof ChainController)['setActiveCaipNetwork'] = caipNetwork => {
    ChainController.setActiveCaipNetwork(caipNetwork)
  }

  public getCaipNetwork = (chainNamespace?: ChainNamespace) => {
    if (chainNamespace) {
      return ChainController.getRequestedCaipNetworks(chainNamespace).filter(
        c => c.chainNamespace === chainNamespace
      )?.[0]
    }

    return ChainController.state.activeCaipNetwork
  }

  public getCaipNetworkId = <T extends number | string>(): T | undefined => {
    const network = this.getCaipNetwork()

    if (network) {
      return network.id as T
    }

    return undefined
  }

  public getCaipNetworks = (namespace: ChainNamespace) =>
    ChainController.getRequestedCaipNetworks(namespace)

  public getActiveChainNamespace = () => ChainController.state.activeChain

  public setRequestedCaipNetworks: (typeof ChainController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    chain: ChainNamespace
  ) => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
  }

  public getApprovedCaipNetworkIds: (typeof ChainController)['getAllApprovedCaipNetworkIds'] = () =>
    ChainController.getAllApprovedCaipNetworkIds()

  public setApprovedCaipNetworksData: (typeof ChainController)['setApprovedCaipNetworksData'] =
    namespace => ChainController.setApprovedCaipNetworksData(namespace)

  public resetNetwork: (typeof ChainController)['resetNetwork'] = (namespace: ChainNamespace) => {
    ChainController.resetNetwork(namespace)
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

  public setSmartAccountEnabledNetworks: (typeof ChainController)['setSmartAccountEnabledNetworks'] =
    (smartAccountEnabledNetworks, chain) => {
      ChainController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
    }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] = (
    preferredAccountType,
    chain
  ) => {
    AccountController.setPreferredAccountType(preferredAccountType, chain)
  }

  public getReownName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

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

  public async disconnect() {
    await this.connectionControllerClient?.disconnect()
  }

  // -- Private ------------------------------------------------------------------
  private async initControllers(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    OptionsController.setDebug(options.debug)
    OptionsController.setProjectId(options.projectId)
    OptionsController.setSdkVersion(options.sdkVersion)

    if (!options.projectId) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')

      return
    }

    this.adapters = options.adapters

    const defaultMetaData = this.getDefaultMetaData()

    if (!options.metadata && defaultMetaData) {
      options.metadata = defaultMetaData
    }

    this.setDefaultNetwork()

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

    if (options.siwx) {
      OptionsController.setSIWX(options.siwx)
    }

    const evmAdapter = options.adapters?.find(
      adapter => adapter.namespace === ConstantsUtil.CHAIN.EVM
    )

    // Set the SIWE client for EVM chains
    if (evmAdapter) {
      if (options.siweConfig) {
        if (options.siwx) {
          throw new Error('Cannot set both `siweConfig` and `siwx` options')
        }

        const siwe = await import('@reown/appkit-siwe')
        if (typeof siwe.mapToSIWX !== 'function') {
          throw new Error('Please update the `@reown/appkit-siwe` package to the latest version')
        }

        OptionsController.setSIWX(siwe.mapToSIWX(options.siweConfig))
      }
    }
  }

  private getDefaultMetaData() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return {
        name: document.getElementsByTagName('title')[0]?.textContent || '',
        description:
          document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content || '',
        url: window.location.origin,
        icons: [document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href || '']
      }
    }

    return null
  }

  private extendCaipNetworks(options: AppKitOptions) {
    const extendedNetworks = CaipNetworksUtil.extendCaipNetworks(options.networks, {
      customNetworkImageUrls: options.chainImages,
      projectId: options.projectId
    })

    return extendedNetworks
  }

  private extendDefaultCaipNetwork(options: AppKitOptions) {
    const defaultNetwork = options.networks.find(n => n.id === options.defaultNetwork?.id)
    const extendedNetwork = defaultNetwork
      ? CaipNetworksUtil.extendCaipNetwork(defaultNetwork, {
          customNetworkImageUrls: options.chainImages,
          projectId: options.projectId
        })
      : undefined

    return extendedNetwork
  }

  private createClients() {
    this.connectionControllerClient = {
      connectWalletConnect: async (onUri: (uri: string) => void) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        this.universalProvider?.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        this.setClientId(
          (await this.universalProvider?.client?.core?.crypto?.getClientId()) || null
        )

        let isAuthenticated = false

        if (this.universalProvider) {
          const chains = this.caipNetworks?.map(network => network.caipNetworkId) || []

          isAuthenticated = await SIWXUtil.universalProviderAuthenticate({
            universalProvider: this.universalProvider,
            chains,
            methods: OPTIONAL_METHODS
          })
        }

        if (isAuthenticated) {
          this.close()
        } else {
          await adapter?.connectWalletConnect(onUri, this.getCaipNetwork()?.id)
        }

        await this.syncWalletConnectAccount()
      },
      connectExternal: async ({ id, info, type, provider, chain, caipNetwork }) => {
        if (chain && chain !== ChainController.state.activeChain && !caipNetwork) {
          const toConnectNetwork = this.caipNetworks?.find(
            network => network.chainNamespace === chain
          )
          if (toConnectNetwork) {
            this.setCaipNetwork(toConnectNetwork)
          }
        }
        const adapter = chain
          ? this.getAdapter(chain)
          : this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        const res = await adapter?.connect({
          id,
          info,
          type,
          provider,
          chainId: caipNetwork?.id || this.getCaipNetwork()?.id,
          rpcUrl:
            caipNetwork?.rpcUrls?.default?.http?.[0] ||
            this.getCaipNetwork()?.rpcUrls?.default?.http?.[0]
        })

        if (res) {
          this.syncProvider({
            ...res,
            chainNamespace: chain || (ChainController.state.activeChain as ChainNamespace)
          })
          await this.syncAccount({
            ...res,
            chainNamespace: chain || (ChainController.state.activeChain as ChainNamespace)
          })
        }

        if (!this.caipNetworks?.some(network => network.id === res?.chainId)) {
          ChainController.showUnsupportedChainUI()
        }
      },
      reconnectExternal: async ({ id, info, type, provider }) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        if (adapter?.reconnect) {
          await adapter?.reconnect({ id, info, type, provider, chainId: this.getCaipNetwork()?.id })
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

        this.setStatus('disconnected', ChainController.state.activeChain as ChainNamespace)

        SafeLocalStorage.removeItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR)
        SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)

        ChainController.state.chains.forEach(chain => {
          this.resetAccount(chain.namespace as ChainNamespace)
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
        if (args.chainNamespace === 'eip155') {
          const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

          const result = await adapter?.sendTransaction(args)

          return result?.hash || ''
        }

        return ''
      },
      estimateGas: async (args: EstimateGasTransactionArgs) => {
        if (args.chainNamespace === 'eip155') {
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
        }

        return 0n
      },
      getEnsAvatar: async () => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.getProfile({
          address: AccountController.state.address as string,
          chainId: Number(this.getCaipNetwork()?.id)
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
          caipNetwork
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
      },
      getCapabilities: async (params: AdapterBlueprint.GetCapabilitiesParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        await adapter?.getCapabilities(params)
      },
      grantPermissions: async (params: AdapterBlueprint.GrantPermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return await adapter?.grantPermissions(params)
      },
      revokePermissions: async (params: AdapterBlueprint.RevokePermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        if (adapter?.revokePermissions) {
          return await adapter.revokePermissions(params)
        }

        return '0x'
      }
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (!caipNetwork) {
          return
        }
        if (
          AccountController.state.address &&
          caipNetwork.chainNamespace === ChainController.state.activeChain
        ) {
          const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
          const provider = ProviderUtil.getProvider<
            UniversalProvider | Provider | W3mFrameProvider
          >(ChainController.state.activeChain as ChainNamespace)
          const providerType =
            ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

          await adapter?.switchNetwork({ caipNetwork, provider, providerType })
          this.setCaipNetwork(caipNetwork)
          await this.syncAccount({
            address: AccountController.state.address,
            chainId: ChainController.state.activeCaipNetwork?.id as string | number,
            chainNamespace: caipNetwork.chainNamespace
          })
        } else if (AccountController.state.address) {
          const providerType =
            ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

          if (providerType === 'AUTH') {
            try {
              ChainController.state.activeChain = caipNetwork.chainNamespace
              await this.connectionControllerClient?.connectExternal?.({
                id: 'ID_AUTH',
                provider: this.authProvider,
                chain: caipNetwork.chainNamespace,
                chainId: caipNetwork.id,
                type: 'AUTH',
                caipNetwork
              })
            } catch (error) {
              const adapter = this.getAdapter(caipNetwork.chainNamespace as ChainNamespace)
              await adapter?.switchNetwork({
                caipNetwork,
                provider: this.authProvider,
                providerType
              })
            }
          } else if (providerType === 'WALLET_CONNECT') {
            this.setCaipNetwork(caipNetwork)
            this.syncWalletConnectAccount()
          } else {
            this.setCaipNetwork(caipNetwork)
            const address = this.getAddressByChainNamespace(caipNetwork.chainNamespace)
            if (address) {
              this.syncAccount({
                address,
                chainId: caipNetwork.id,
                chainNamespace: caipNetwork.chainNamespace
              })
            }
          }
        } else {
          this.setCaipNetwork(caipNetwork)
        }
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      getApprovedCaipNetworksData: async () => {
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

        if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
          const namespaces = this.universalProvider?.session?.namespaces

          return {
            supportsAllNetworks: false,
            approvedCaipNetworkIds: this.getChainsFromNamespaces(namespaces)
          }
        }

        return { supportsAllNetworks: true, approvedCaipNetworkIds: [] }
      }
    }
    if (this.networkControllerClient && this.connectionControllerClient) {
      ConnectionController.setClient(this.connectionControllerClient)
    }
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
        id: 'ID_AUTH',
        info: {
          name: 'ID_AUTH'
        },
        type: 'AUTH',
        provider,
        chainId: ChainController.state.activeCaipNetwork?.id
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
      const isConnectedWithAuth = connectedConnector === 'ID_AUTH'
      if (!isConnected && isConnectedWithAuth) {
        this.setCaipAddress(undefined, ChainController.state.activeChain as ChainNamespace)
        this.setLoading(false)
      }
    })
    provider.onIsConnected(() => {
      provider.connect()
    })
    provider.onConnect(async user => {
      const namespace = ChainController.state.activeChain as ChainNamespace
      this.syncProvider({
        type: 'AUTH',
        provider,
        id: 'ID_AUTH',
        chainNamespace: namespace
      })

      const caipAddress =
        ChainController.state.activeChain === 'eip155'
          ? (`eip155:${user.chainId}:${user.address}` as CaipAddress)
          : (`${user.chainId}:${user.address}` as CaipAddress)
      this.setCaipAddress(caipAddress, namespace)
      this.setSmartAccountDeployed(Boolean(user.smartAccountDeployed), namespace)

      const preferredAccountType = (user.preferredAccountType || 'eoa') as W3mFrameTypes.AccountType
      this.setPreferredAccountType(preferredAccountType, namespace)

      const userAccounts = user.accounts?.map(account =>
        CoreHelperUtil.createAccount(
          namespace,
          account.address,
          namespace === 'eip155' ? preferredAccountType : 'eoa'
        )
      )
      this.setAllAccounts(
        userAccounts || [
          CoreHelperUtil.createAccount(namespace, user.address, preferredAccountType)
        ],
        namespace
      )

      await provider.getSmartAccountEnabledNetworks()

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

  private listenWalletConnect() {
    if (this.universalProvider) {
      this.universalProvider.on('disconnect', () => {
        this.chainNamespaces.forEach(namespace => {
          this.resetAccount(namespace)
        })
        ConnectionController.resetWcConnection()
      })

      this.universalProvider.on('chainChanged', (chainId: number | string) => {
        const caipNetwork = this.caipNetworks?.find(
          // eslint-disable-next-line eqeqeq
          c => c.chainNamespace === ChainController.state.activeChain && c.id == chainId
        )
        const currentCaipNetwork = this.getCaipNetwork()

        if (!caipNetwork) {
          const namespace = this.getActiveChainNamespace() || ConstantsUtil.CHAIN.EVM
          ChainController.setActiveCaipNetwork({
            id: chainId,
            caipNetworkId: `${namespace}:${chainId}`,
            name: 'Unknown Network',
            chainNamespace: namespace,
            nativeCurrency: {
              name: '',
              decimals: 0,
              symbol: ''
            },
            rpcUrls: {
              default: {
                http: []
              }
            }
          })

          return
        }

        if (!currentCaipNetwork || currentCaipNetwork?.id !== caipNetwork?.id) {
          this.setCaipNetwork(caipNetwork)
        }
      })
    }
  }

  private listenAdapter(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    adapter?.on('switchNetwork', ({ address, chainId }) => {
      if (chainId && this.caipNetworks?.find(n => n.id === chainId)) {
        if (ChainController.state.activeChain === chainNamespace && address) {
          this.syncAccount({ address, chainId, chainNamespace })
        } else if (
          ChainController.state.activeChain === chainNamespace &&
          AccountController.state.address
        ) {
          this.syncAccount({
            address: AccountController.state.address,
            chainId,
            chainNamespace
          })
        }
      } else {
        ChainController.showUnsupportedChainUI()
      }
    })

    adapter?.on('disconnect', () => {
      if (ChainController.state.activeChain === chainNamespace) {
        this.handleDisconnect()
      }
    })

    adapter?.on('accountChanged', ({ address, chainId }) => {
      if (ChainController.state.activeChain === chainNamespace && chainId) {
        this.syncAccount({
          address,
          chainId,
          chainNamespace
        })
      } else if (
        ChainController.state.activeChain === chainNamespace &&
        ChainController.state.activeCaipNetwork?.id
      ) {
        this.syncAccount({
          address,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chainNamespace
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

  private async syncWalletConnectAccount() {
    const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
    StorageUtil.setConnectedNamespace(ChainController.state.activeChain as ChainNamespace)
    this.chainNamespaces.forEach(async chainNamespace => {
      const caipAddress = this.universalProvider?.session?.namespaces?.[chainNamespace]
        ?.accounts[0] as CaipAddress

      if (caipAddress) {
        ProviderUtil.setProviderId(
          chainNamespace,
          UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
        )

        if (
          this.caipNetworks &&
          ChainController.state.activeCaipNetwork &&
          (adapter as ChainAdapter)?.namespace !== 'eip155'
        ) {
          const provider = adapter?.getWalletConnectProvider({
            caipNetworks: this.caipNetworks,
            provider: this.universalProvider,
            activeCaipNetwork: ChainController.state.activeCaipNetwork
          })
          ProviderUtil.setProvider(chainNamespace, provider)
        } else {
          ProviderUtil.setProvider(chainNamespace, this.universalProvider)
        }

        StorageUtil.setConnectedConnector(
          UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
        )

        let address = ''

        if (caipAddress.split(':').length === 3) {
          address = caipAddress.split(':')[2] as string
        } else {
          address = AccountController.state.address as string
        }

        if ((adapter as ChainAdapter)?.adapterType === 'wagmi') {
          try {
            await adapter?.connect({
              id: 'walletConnect',
              type: 'WALLET_CONNECT',
              chainId: ChainController.state.activeCaipNetwork?.id as string | number
            })
          } catch (error) {
            /**
             * Handle edge case where wagmi detects existing connection but lacks to complete UniversalProvider instance.
             * Connection attempt fails due to already connected state - reconnect to restore provider state.
             */
            if (adapter?.reconnect) {
              adapter?.reconnect({
                id: 'walletConnect',
                type: 'WALLET_CONNECT'
              })
            }
          }
        }

        this.syncWalletConnectAccounts(chainNamespace)

        await this.syncAccount({
          address,
          chainId:
            ChainController.state.activeChain === chainNamespace
              ? (ChainController.state.activeCaipNetwork?.id as string | number)
              : (this.caipNetworks?.find(n => n.chainNamespace === chainNamespace)?.id as
                  | string
                  | number),
          chainNamespace
        })
      }
    })

    await ChainController.setApprovedCaipNetworksData(
      ChainController.state.activeChain as ChainNamespace
    )
  }

  private syncWalletConnectAccounts(chainNamespace: ChainNamespace) {
    const addresses = this.universalProvider?.session?.namespaces?.[chainNamespace]?.accounts
      ?.map(account => {
        const [, , address] = account.split(':')

        return address
      })
      .filter((address, index, self) => self.indexOf(address) === index) as string[]

    if (addresses) {
      this.setAllAccounts(
        addresses.map(address =>
          CoreHelperUtil.createAccount(
            chainNamespace,
            address,
            chainNamespace === 'bip122' ? 'payment' : 'eoa'
          )
        ),
        chainNamespace
      )
    }
  }

  private syncProvider({
    type,
    provider,
    id,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'type' | 'provider' | 'id'> & {
    chainNamespace: ChainNamespace
  }) {
    ProviderUtil.setProviderId(chainNamespace, type)
    ProviderUtil.setProvider(chainNamespace, provider)

    StorageUtil.setConnectedConnector(id as ConnectorType)
    StorageUtil.setConnectedNamespace(ChainController.state.activeChain as ChainNamespace)
  }

  private async syncAccount({
    address,
    chainId,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
    chainNamespace: ChainNamespace
  }) {
    this.setPreferredAccountType(
      AccountController.state.preferredAccountType
        ? AccountController.state.preferredAccountType
        : 'eoa',
      ChainController.state.activeChain as ChainNamespace
    )

    this.setCaipAddress(
      `${chainNamespace}:${chainId}:${address}` as `${ChainNamespace}:${string}:${string}`,
      chainNamespace
    )

    this.setStatus('connected', chainNamespace)

    if (chainNamespace === ChainController.state.activeChain) {
      const caipNetwork = this.caipNetworks?.find(
        n => n.id === chainId && n.chainNamespace === chainNamespace
      )

      if (caipNetwork) {
        this.setCaipNetwork(caipNetwork)
      } else {
        this.setCaipNetwork(this.caipNetworks?.find(n => n.chainNamespace === chainNamespace))
      }

      this.syncConnectedWalletInfo(chainNamespace)
      const adapter = this.getAdapter(chainNamespace)

      const balance = await adapter?.getBalance({
        address,
        chainId,
        caipNetwork: caipNetwork || this.getCaipNetwork(),
        tokens: this.options.tokens
      })
      if (balance) {
        this.setBalance(balance.balance, balance.symbol, chainNamespace)
      }
      await this.syncIdentity({ address, chainId: Number(chainId), chainNamespace })
    }
  }

  private syncConnectedWalletInfo(chainNamespace: ChainNamespace) {
    const currentActiveWallet = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR)
    const providerType = ProviderUtil.state.providerIds[chainNamespace]

    if (
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED ||
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
    ) {
      if (currentActiveWallet) {
        const connector = this.getConnectors().find(c => c.id === currentActiveWallet)

        if (connector?.info) {
          this.setConnectedWalletInfo({ ...connector.info }, chainNamespace)
        }
      }
    } else if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
      const provider = ProviderUtil.getProvider(chainNamespace)

      if (provider?.session) {
        this.setConnectedWalletInfo(
          {
            ...provider.session.peer.metadata,
            name: provider.session.peer.metadata.name,
            icon: provider.session.peer.metadata.icons?.[0]
          },
          chainNamespace
        )
      }
    } else if (providerType === UtilConstantsUtil.COINBASE_CONNECTOR_ID) {
      const connector = this.getConnectors().find(
        c => c.id === UtilConstantsUtil.COINBASE_CONNECTOR_ID
      )

      this.setConnectedWalletInfo(
        { name: 'Coinbase Wallet', icon: this.getConnectorImage(connector) },
        chainNamespace
      )
    } else if (currentActiveWallet) {
      this.setConnectedWalletInfo({ name: currentActiveWallet }, chainNamespace)
    }
  }

  private async syncIdentity({
    address,
    chainId,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
    chainNamespace: ChainNamespace
  }) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        address
      })

      this.setProfileName(name, chainNamespace)
      this.setProfileImage(avatar, chainNamespace)

      if (!name) {
        await this.syncReownName(address, chainNamespace)
        const adapter = this.getAdapter(chainNamespace)
        const result = await adapter?.getProfile({
          address,
          chainId: Number(chainId)
        })

        if (result?.profileName) {
          this.setProfileName(result.profileName, chainNamespace)
          if (result.profileImage) {
            this.setProfileImage(result.profileImage, chainNamespace)
          }
        } else {
          await this.syncReownName(address, chainNamespace)
          this.setProfileImage(null, chainNamespace)
        }
      }
    } catch {
      if (chainId === 1) {
        await this.syncReownName(address, chainNamespace)
      } else {
        await this.syncReownName(address, chainNamespace)
        this.setProfileImage(null, chainNamespace)
      }
    }
  }

  private async syncReownName(address: string, chainNamespace: ChainNamespace) {
    try {
      const registeredWcNames = await this.getReownName(address)
      if (registeredWcNames[0]) {
        const wcName = registeredWcNames[0]
        this.setProfileName(wcName.name, chainNamespace)
      } else {
        this.setProfileName(null, chainNamespace)
      }
    } catch {
      this.setProfileName(null, chainNamespace)
    }
  }

  private syncRequestedNetworks() {
    const uniqueChainNamespaces = [
      ...new Set(this.caipNetworks?.map(caipNetwork => caipNetwork.chainNamespace))
    ]
    this.chainNamespaces = uniqueChainNamespaces

    uniqueChainNamespaces.forEach(chainNamespace =>
      this.setRequestedCaipNetworks(
        this.caipNetworks?.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace) ??
          [],
        chainNamespace
      )
    )
  }

  private async syncExistingConnection() {
    const connectedConnector = SafeLocalStorage.getItem(
      SafeLocalStorageKeys.CONNECTED_CONNECTOR
    ) as ConnectorType
    const connectedNamespace = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_NAMESPACE)

    if (
      connectedConnector === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT &&
      connectedNamespace
    ) {
      this.syncWalletConnectAccount()
    } else if (
      connectedConnector &&
      connectedConnector !== UtilConstantsUtil.CONNECTOR_TYPE_W3M_AUTH &&
      connectedNamespace
    ) {
      const adapter = this.getAdapter(connectedNamespace as ChainNamespace)
      const res = await adapter?.syncConnection({
        id: connectedConnector,
        chainId: this.getCaipNetwork()?.id,
        namespace: connectedNamespace as ChainNamespace,
        rpcUrl: this.getCaipNetwork()?.rpcUrls?.default?.http?.[0] as string
      })

      if (res) {
        this.syncProvider({ ...res, chainNamespace: connectedNamespace as ChainNamespace })
        await this.syncAccount({ ...res, chainNamespace: connectedNamespace as ChainNamespace })
      }

      if (!this.caipNetworks?.some(network => network.id === res?.chainId)) {
        ChainController.showUnsupportedChainUI()
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
      this.universalProviderInitPromise = this.initializeUniversalAdapter()
    }

    return this.universalProviderInitPromise
  }

  private async initializeUniversalAdapter() {
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
      this.authProvider = W3mFrameProviderSingleton.getInstance({
        projectId: this.options.projectId
      })
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
          networks: this.caipNetworks
        })
        if (this.universalProvider) {
          adapters[namespace].setUniversalProvider(this.universalProvider)
        }
        if (this.authProvider) {
          adapters[namespace].setAuthProvider(this.authProvider)
        }

        adapters[namespace].syncConnectors(this.options, this)
      } else {
        adapters[namespace] = new UniversalAdapter({
          namespace,
          networks: this.caipNetworks
        })
        if (this.universalProvider) {
          adapters[namespace].setUniversalProvider(this.universalProvider)
        }
        if (this.authProvider) {
          adapters[namespace].setAuthProvider(this.authProvider)
        }
      }

      ChainController.state.chains.set(namespace, {
        namespace,
        connectionControllerClient: this.connectionControllerClient,
        networkControllerClient: this.networkControllerClient,
        networkState,
        accountState,
        caipNetworks: this.caipNetworks ?? []
      })

      return adapters
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, {} as Adapters)
  }

  private async initChainAdapters() {
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/require-await
      this.chainNamespaces.map(async namespace => {
        if (this.options) {
          this.listenAdapter(namespace)

          this.setConnectors(this.chainAdapters?.[namespace]?.connectors || [])
        }
      })
    )
    this.listenWalletConnect()
  }

  private setDefaultNetwork() {
    const previousNetwork = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
    const caipNetwork =
      previousNetwork && this.caipNetworks?.length
        ? this.caipNetworks.find(n => n.caipNetworkId === previousNetwork)
        : undefined

    const network = caipNetwork || this.defaultCaipNetwork || this.caipNetworks?.[0]
    if (network) {
      ChainController.setActiveCaipNetwork(network)
    }
  }

  private async initOrContinue() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([
          import('@reown/appkit-ui-new'),
          import('@reown/appkit-scaffold-ui-new/w3m-modal')
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
}
