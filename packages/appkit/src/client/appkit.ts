/* eslint-disable max-depth */
import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  type EmbeddedWalletTimeoutReason,
  getW3mThemeVariables
} from '@reown/appkit-common'
import {
  ApiController,
  ConnectionController,
  ConnectorController,
  type ConnectorType,
  ConstantsUtil as CoreConstantsUtil,
  EventsController,
  type Features,
  type Metadata,
  PublicStateController,
  type RemoteFeatures,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import {
  AccountController,
  AlertController,
  ChainController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-controllers'
import {
  ErrorUtil,
  HelpersUtil,
  ProviderUtil,
  ConstantsUtil as UtilConstantsUtil
} from '@reown/appkit-utils'
import { W3mFrameHelpers, W3mFrameProvider } from '@reown/appkit-wallet'
import type { W3mFrameTypes } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import type { AdapterBlueprint } from '../adapters/ChainAdapterBlueprint.js'
import { W3mFrameProviderSingleton } from '../auth-provider/W3MFrameProviderSingleton.js'
import { AppKitBaseClient, type AppKitOptionsWithSdk } from './appkit-base-client.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Export Controllers -------------------------------------------------------
export { AccountController }

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitBaseClient {
  static override instance?: AppKit

  private authProvider?: W3mFrameProvider

  // -- Private ------------------------------------------------------------------

  private onAuthProviderConnected(user: W3mFrameTypes.Responses['FrameGetUserResponse']) {
    const namespace = ChainController.state.activeChain as ChainNamespace

    // To keep backwards compatibility, eip155 chainIds are numbers and not actual caipChainIds
    const caipAddress =
      namespace === ConstantsUtil.CHAIN.EVM
        ? (`eip155:${user.chainId}:${user.address}` as CaipAddress)
        : (`${user.chainId}:${user.address}` as CaipAddress)

    const defaultAccountType = OptionsController.state.defaultAccountTypes[namespace]
    const currentAccountType = getPreferredAccountType(namespace)
    const preferredAccountType =
      (user.preferredAccountType as W3mFrameTypes.AccountType) ||
      currentAccountType ||
      defaultAccountType

    /*
     * This covers the case where user switches back from a smart account supported
     *  network to a non-smart account supported network resulting in a different address
     */

    if (!HelpersUtil.isLowerCaseMatch(user.address, AccountController.state.address)) {
      this.syncIdentity({
        address: user.address,
        chainId: user.chainId,
        chainNamespace: namespace
      })
    }

    this.setCaipAddress(caipAddress, namespace)
    this.setUser({ ...(AccountController.state.user || {}), ...user }, namespace)
    this.setSmartAccountDeployed(Boolean(user.smartAccountDeployed), namespace)
    this.setPreferredAccountType(preferredAccountType, namespace)

    this.setLoading(false, namespace)
  }
  private setupAuthConnectorListeners(provider: W3mFrameProvider) {
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
          this.popTransactionStack('error')
        }
      }
    })
    provider.onRpcSuccess((_, request) => {
      const isSafeRequest = W3mFrameHelpers.checkIfRequestIsSafe(request)
      const address = AccountController.state.address
      const caipNetwork = ChainController.state.activeCaipNetwork

      if (isSafeRequest) {
        return
      }

      if (address && caipNetwork?.id) {
        this.updateNativeBalance(address, caipNetwork.id, caipNetwork.chainNamespace)
      }

      if (this.isTransactionStackEmpty()) {
        this.close()
      } else {
        this.popTransactionStack('success')
      }
    })
    provider.onNotConnected(() => {
      const namespace = ChainController.state.activeChain as ChainNamespace
      const connectorId = ConnectorController.getConnectorId(namespace)
      const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH

      if (isConnectedWithAuth) {
        this.setCaipAddress(undefined, namespace)
        this.setLoading(false, namespace)
      }
    })
    provider.onConnect(this.onAuthProviderConnected.bind(this))
    provider.onSocialConnected(this.onAuthProviderConnected.bind(this))
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

  private async syncAuthConnector(provider: W3mFrameProvider, chainNamespace: ChainNamespace) {
    const isAuthSupported = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.includes(chainNamespace)
    const shouldSync = chainNamespace === ChainController.state.activeChain

    if (!isAuthSupported) {
      return
    }

    this.setLoading(true, chainNamespace)
    const isLoginEmailUsed = provider.getLoginEmailUsed()
    this.setLoading(isLoginEmailUsed, chainNamespace)

    if (isLoginEmailUsed) {
      this.setStatus('connecting', chainNamespace)
    }

    const email = provider.getEmail()
    const username = provider.getUsername()

    this.setUser({ ...(AccountController.state?.user || {}), username, email }, chainNamespace)
    this.setupAuthConnectorListeners(provider)

    const { isConnected } = await provider.isConnected()

    const theme = ThemeController.getSnapshot()
    const options = OptionsController.getSnapshot()

    await Promise.all([
      provider.syncDappData({
        metadata: options.metadata as Metadata,
        sdkVersion: options.sdkVersion,
        projectId: options.projectId,
        sdkType: options.sdkType
      }),
      provider.syncTheme({
        themeMode: theme.themeMode,
        themeVariables: theme.themeVariables,
        w3mThemeVariables: getW3mThemeVariables(theme.themeVariables, theme.themeMode)
      })
    ])

    if (chainNamespace && isAuthSupported && shouldSync) {
      const enabledNetworks = await provider.getSmartAccountEnabledNetworks()
      ChainController.setSmartAccountEnabledNetworks(
        enabledNetworks?.smartAccountEnabledNetworks || [],
        chainNamespace
      )
      if (isConnected && this.connectionControllerClient?.connectExternal) {
        await this.connectionControllerClient?.connectExternal({
          id: ConstantsUtil.CONNECTOR_ID.AUTH,
          info: { name: ConstantsUtil.CONNECTOR_ID.AUTH },
          type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
          provider,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chain: chainNamespace
        })
        this.setStatus('connected', chainNamespace)
      } else if (
        ConnectorController.getConnectorId(chainNamespace) === ConstantsUtil.CONNECTOR_ID.AUTH
      ) {
        this.setStatus('disconnected', chainNamespace)
        StorageUtil.removeConnectedNamespace(chainNamespace)
      }
    }

    this.setLoading(false, chainNamespace)
  }

  private async checkExistingTelegramSocialConnection(chainNamespace: ChainNamespace) {
    try {
      if (!CoreHelperUtil.isTelegram()) {
        return
      }
      const socialProviderToConnect = StorageUtil.getTelegramSocialProvider()
      if (!socialProviderToConnect) {
        return
      }
      if (!CoreHelperUtil.isClient()) {
        return
      }
      const url = new URL(window.location.href)
      const resultUri = url.searchParams.get('result_uri')
      if (!resultUri) {
        return
      }
      AccountController.setSocialProvider(socialProviderToConnect, chainNamespace)
      await this.authProvider?.init()
      const authConnector = ConnectorController.getAuthConnector()
      if (socialProviderToConnect && authConnector) {
        this.setLoading(true, chainNamespace)

        await ConnectionController.connectExternal(
          {
            id: authConnector.id,
            type: authConnector.type,
            socialUri: resultUri
          },
          authConnector.chain
        )

        StorageUtil.setConnectedSocialProvider(socialProviderToConnect)
        StorageUtil.removeTelegramSocialProvider()

        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_SUCCESS',
          properties: { provider: socialProviderToConnect }
        })
      }
    } catch (error) {
      this.setLoading(false, chainNamespace)
      // eslint-disable-next-line no-console
      console.error('checkExistingSTelegramocialConnection error', error)
    }

    try {
      const url = new URL(window.location.href)
      // Remove the 'result_uri' parameter
      url.searchParams.delete('result_uri')
      // Update the URL without reloading the page
      window.history.replaceState({}, document.title, url.toString())
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('tma social login failed', error)
    }
  }

  private createAuthProvider(chainNamespace: ChainNamespace) {
    const isSupported = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.includes(chainNamespace)

    if (!isSupported) {
      return
    }

    const isEmailEnabled = this.remoteFeatures?.email
    const isSocialsEnabled =
      Array.isArray(this.remoteFeatures?.socials) && this.remoteFeatures.socials.length > 0
    const isAuthEnabled = isEmailEnabled || isSocialsEnabled

    const activeNamespaceConnectedToAuth = HelpersUtil.getActiveNamespaceConnectedToAuth()
    const namespaceToConnect = activeNamespaceConnectedToAuth || chainNamespace

    if (!this.authProvider && this.options?.projectId && isAuthEnabled) {
      this.authProvider = W3mFrameProviderSingleton.getInstance({
        projectId: this.options.projectId,
        enableLogger: this.options.enableAuthLogger,
        chainId: this.getCaipNetwork(namespaceToConnect)?.caipNetworkId,
        abortController: ErrorUtil.EmbeddedWalletAbortController,
        onTimeout: (reason: EmbeddedWalletTimeoutReason) => {
          if (reason === 'iframe_load_failed') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_LOAD_FAILED, 'error')
          } else if (reason === 'iframe_request_timeout') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_REQUEST_TIMEOUT, 'error')
          } else if (reason === 'unverified_domain') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.UNVERIFIED_DOMAIN, 'error')
          }
        },
        getActiveCaipNetwork: (namespace?: ChainNamespace) =>
          ChainController.getActiveCaipNetwork(namespace)
      })
      PublicStateController.subscribeOpen(isOpen => {
        if (!isOpen && this.isTransactionStackEmpty()) {
          this.authProvider?.rejectRpcRequests()
        }
      })
    }

    const shouldSync = chainNamespace === ChainController.state.activeChain

    if (this.authProvider && shouldSync) {
      this.syncAuthConnector(this.authProvider, chainNamespace)
      this.checkExistingTelegramSocialConnection(chainNamespace)
    }
  }

  private createAuthProviderForAdapter(chainNamespace: ChainNamespace) {
    // Override as we need to set authProvider for each adapter
    this.createAuthProvider(chainNamespace)

    if (this.authProvider) {
      this.chainAdapters?.[chainNamespace]?.setAuthProvider?.(this.authProvider)
    }
  }

  // -- Overrides ----------------------------------------------------------------
  protected override initControllers(options: AppKitOptionsWithSdk) {
    super.initControllers(options)

    if (this.options.excludeWalletIds) {
      ApiController.initializeExcludedWallets({ ids: this.options.excludeWalletIds })
    }
  }

  protected override async switchCaipNetwork(caipNetwork: CaipNetwork) {
    if (!caipNetwork) {
      return
    }

    const currentNamespace = ChainController.state.activeChain
    const networkNamespace = caipNetwork.chainNamespace
    const namespaceAddress = this.getAddressByChainNamespace(networkNamespace)
    const isSameNamespace = networkNamespace === currentNamespace

    if (isSameNamespace && namespaceAddress) {
      const adapter = this.getAdapter(networkNamespace)
      const provider = ProviderUtil.getProvider(networkNamespace)
      const providerType = ProviderUtil.getProviderId(networkNamespace)

      await adapter?.switchNetwork({ caipNetwork, provider, providerType })
      this.setCaipNetwork(caipNetwork)
    } else {
      const currentNamespaceProviderType = ProviderUtil.getProviderId(currentNamespace)
      const isCurrentNamespaceAuthProvider =
        currentNamespaceProviderType === UtilConstantsUtil.CONNECTOR_TYPE_AUTH

      const newNamespaceProviderType = ProviderUtil.getProviderId(networkNamespace)
      const isNewNamespaceAuthProvider =
        newNamespaceProviderType === UtilConstantsUtil.CONNECTOR_TYPE_AUTH
      const isNewNamespaceSupportsAuthConnector =
        ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.includes(networkNamespace)

      /*
       * Only connect with the auth connector if:
       * 1. The current namespace is an auth connector AND
       *    the new namespace provider type is undefined
       * OR
       * 2. The new namespace provider type is auth connector AND
       *    the new namespace supports auth connector
       *
       * Note: There are cases where the current namespace is an auth connector
       * but the new namespace uses a different connector type (injected, walletconnect, etc).
       * In those cases, we should not connect with the auth connector.
       */
      if (
        ((isCurrentNamespaceAuthProvider && newNamespaceProviderType === undefined) ||
          isNewNamespaceAuthProvider) &&
        isNewNamespaceSupportsAuthConnector
      ) {
        try {
          ChainController.state.activeChain = caipNetwork.chainNamespace

          if (namespaceAddress) {
            const adapter = this.getAdapter(networkNamespace as ChainNamespace)
            await adapter?.switchNetwork({
              caipNetwork,
              provider: this.authProvider,
              providerType: newNamespaceProviderType
            })
          } else {
            await this.connectionControllerClient?.connectExternal?.({
              id: ConstantsUtil.CONNECTOR_ID.AUTH,
              provider: this.authProvider,
              chain: networkNamespace,
              chainId: caipNetwork.id,
              type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
              caipNetwork
            })
          }
          this.setCaipNetwork(caipNetwork)
        } catch (error) {
          const adapter = this.getAdapter(networkNamespace as ChainNamespace)
          await adapter?.switchNetwork({
            caipNetwork,
            provider: this.authProvider,
            providerType: newNamespaceProviderType
          })
        }
      } else if (newNamespaceProviderType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
        /*
         * Switch network for adapters, as each manages
         * its own connections state and requires network updates
         */
        if (!ChainController.state.noAdapters) {
          const adapter = this.getAdapter(networkNamespace)
          const provider = ProviderUtil.getProvider(networkNamespace)
          const providerType = ProviderUtil.getProviderId(networkNamespace)

          await adapter?.switchNetwork({ caipNetwork, provider, providerType })
        }
        this.setCaipNetwork(caipNetwork)
        this.syncWalletConnectAccount()
      } else {
        this.setCaipNetwork(caipNetwork)
        if (namespaceAddress) {
          this.syncAccount({
            address: namespaceAddress,
            chainId: caipNetwork.id,
            chainNamespace: networkNamespace
          })
        }
      }
    }
  }

  protected override async initialize(options: AppKitOptionsWithSdk) {
    await super.initialize(options)
    this.chainNamespaces?.forEach(namespace => {
      this.createAuthProviderForAdapter(namespace)
    })
    await this.injectModalUi()
    PublicStateController.set({ initialized: true })
  }
  public override async syncIdentity({
    address,
    chainId,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
    chainNamespace: ChainNamespace
  }) {
    const caipNetworkId: CaipNetworkId = `${chainNamespace}:${chainId}`
    const activeCaipNetwork = this.caipNetworks?.find(n => n.caipNetworkId === caipNetworkId)

    if (chainNamespace !== ConstantsUtil.CHAIN.EVM || activeCaipNetwork?.testnet) {
      this.setProfileName(null, chainNamespace)
      this.setProfileImage(null, chainNamespace)

      return
    }

    try {
      const { name, avatar } = await this.fetchIdentity({
        address,
        caipNetworkId
      })

      this.setProfileName(name, chainNamespace)
      this.setProfileImage(avatar, chainNamespace)
    } catch {
      await this.syncReownName(address, chainNamespace)
      if (chainId !== 1) {
        this.setProfileImage(null, chainNamespace)
      }
    }
  }

  protected override syncConnectedWalletInfo(chainNamespace: ChainNamespace): void {
    const providerType = ProviderUtil.getProviderId(chainNamespace)
    if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_AUTH) {
      const provider = this.authProvider

      if (provider) {
        const social = StorageUtil.getConnectedSocialProvider() ?? 'email'
        const identifier = provider.getEmail() ?? provider.getUsername()

        this.setConnectedWalletInfo({ name: providerType, identifier, social }, chainNamespace)
      }
    } else {
      super.syncConnectedWalletInfo(chainNamespace)
    }
  }

  protected override async injectModalUi() {
    // Skip entirely in non-browser environments - ensures proper tree-shaking during build
    if (!CoreHelperUtil.isClient()) {
      return
    }

    if (!isInitialized) {
      try {
        const features = { ...CoreConstantsUtil.DEFAULT_FEATURES, ...this.options.features }
        const remoteFeatures = this.remoteFeatures

        // Use a factory function that will be properly tree-shaken in SSR builds
        await this.loadModalComponents(features, remoteFeatures)

        // Always check again in case environment changed during async operations
        if (CoreHelperUtil.isClient()) {
          const isElementCreated = document.querySelector('w3m-modal')
          if (!isElementCreated) {
            const modal = document.createElement('w3m-modal')
            if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
              document.body.insertAdjacentElement('beforeend', modal)
            }
          }
        }

        isInitialized = true
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error injecting modal UI:', error)
      }
    }
  }

  // This separate method helps with tree-shaking for SSR builds
  private async loadModalComponents(features: Features, remoteFeatures: RemoteFeatures) {
    // Early explicit check forces bundlers to exclude this code in SSR builds
    if (!CoreHelperUtil.isClient()) {
      return
    }

    const featureImportPromises = []

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const usingEmbeddedWallet =
      remoteFeatures.email || (remoteFeatures.socials && remoteFeatures.socials.length > 0)
    if (usingEmbeddedWallet) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/embedded-wallet'))
    }

    if (remoteFeatures.email) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/email'))
    }
    if (remoteFeatures.socials) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/socials'))
    }

    if (remoteFeatures.swaps && remoteFeatures.swaps.length > 0) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/swaps'))
    }

    if (features.send) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/send'))
    }

    if (features.receive) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/receive'))
    }

    if (remoteFeatures.onramp && remoteFeatures.onramp.length > 0) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/onramp'))
    }

    if (remoteFeatures.activity) {
      featureImportPromises.push(import('@reown/appkit-scaffold-ui/transactions'))
    }

    if (features.pay) {
      featureImportPromises.push(import('@reown/appkit-pay'))
    }

    await Promise.all([
      ...featureImportPromises,
      import('@reown/appkit-scaffold-ui'),
      import('@reown/appkit-scaffold-ui/w3m-modal')
    ])
  }
}
