/* eslint-disable max-depth */
import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil,
  getW3mThemeVariables
} from '@reown/appkit-common'
import {
  ApiController,
  ConnectionController,
  ConnectorController,
  type ConnectorType,
  ConstantsUtil as CoreConstantsUtil,
  EventsController,
  type Metadata
} from '@reown/appkit-core'
import {
  AccountController,
  AlertController,
  ChainController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-core'
import { ErrorUtil, HelpersUtil, ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'
import { W3mFrameHelpers, W3mFrameProvider } from '@reown/appkit-wallet'
import type { W3mFrameTypes } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { W3mFrameProviderSingleton } from '../auth-provider/W3MFrameProviderSingleton.js'
import { ProviderUtil } from '../store/ProviderUtil.js'
import { AppKitCore, type AppKitOptionsWithSdk } from './core.js'

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
export class AppKit extends AppKitCore {
  static override instance?: AppKit

  private authProvider?: W3mFrameProvider

  // -- Private ------------------------------------------------------------------
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
        if (AccountController.state.address && ChainController.state.activeCaipNetwork?.id) {
          this.updateNativeBalance()
        }
      } else {
        this.popTransactionStack()
        if (AccountController.state.address && ChainController.state.activeCaipNetwork?.id) {
          this.updateNativeBalance()
        }
      }
    })
    provider.onNotConnected(() => {
      const namespace = ChainController.state.activeChain as ChainNamespace
      const connectorId = StorageUtil.getConnectedConnectorId(namespace)
      const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH
      if (isConnectedWithAuth) {
        this.setCaipAddress(undefined, namespace)
        this.setLoading(false)
      }
    })
    provider.onConnect(async user => {
      const namespace = ChainController.state.activeChain as ChainNamespace

      // To keep backwards compatibility, eip155 chainIds are numbers and not actual caipChainIds
      const caipAddress =
        namespace === ConstantsUtil.CHAIN.EVM
          ? (`eip155:${user.chainId}:${user.address}` as CaipAddress)
          : (`${user.chainId}:${user.address}` as CaipAddress)
      this.setSmartAccountDeployed(Boolean(user.smartAccountDeployed), namespace)
      /*
       * This covers the case where user switches back from a smart account supported
       *  network to a non-smart account supported network resulting in a different address
       */

      this.setCaipAddress(caipAddress, namespace)
      if (!HelpersUtil.isLowerCaseMatch(user.address, AccountController.state.address)) {
        this.syncIdentity({
          address: user.address,
          chainId: user.chainId,
          chainNamespace: namespace
        })
      }

      this.setUser({ ...(AccountController.state.user || {}), email: user.email }, namespace)

      const preferredAccountType = (user.preferredAccountType ||
        OptionsController.state.defaultAccountTypes[namespace]) as W3mFrameTypes.AccountType
      this.setPreferredAccountType(preferredAccountType, namespace)

      const userAccounts = user.accounts?.map(account =>
        CoreHelperUtil.createAccount(
          namespace,
          account.address,
          account.type || OptionsController.state.defaultAccountTypes[namespace]
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
    provider.onSocialConnected(({ userName }) => {
      this.setUser(
        { ...(AccountController.state.user || {}), username: userName },
        ChainController.state.activeChain
      )
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

  private async syncAuthConnector(provider: W3mFrameProvider) {
    this.setLoading(true)
    const isLoginEmailUsed = provider.getLoginEmailUsed()
    this.setLoading(isLoginEmailUsed)

    if (isLoginEmailUsed) {
      this.setStatus('connecting', ChainController.state.activeChain as ChainNamespace)
    }

    const email = provider.getEmail()
    const username = provider.getUsername()

    this.setUser(
      { ...(AccountController.state?.user || {}), username, email },
      ChainController.state.activeChain
    )

    this.setupAuthConnectorListeners(provider)

    const { isConnected } = await provider.isConnected()

    const theme = ThemeController.getSnapshot()
    const options = OptionsController.getSnapshot()

    provider.syncDappData({
      metadata: options.metadata as Metadata,
      sdkVersion: options.sdkVersion,
      projectId: options.projectId,
      sdkType: options.sdkType
    })
    provider.syncTheme({
      themeMode: theme.themeMode,
      themeVariables: theme.themeVariables,
      w3mThemeVariables: getW3mThemeVariables(theme.themeVariables, theme.themeMode)
    })

    const namespace = StorageUtil.getActiveNamespace()

    if (namespace) {
      if (isConnected && this.connectionControllerClient?.connectExternal) {
        await this.connectionControllerClient?.connectExternal({
          id: ConstantsUtil.CONNECTOR_ID.AUTH,
          info: { name: ConstantsUtil.CONNECTOR_ID.AUTH },
          type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
          provider,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chain: namespace
        })
        this.setStatus('connected', namespace)
      } else if (
        StorageUtil.getConnectedConnectorId(namespace) === ConstantsUtil.CONNECTOR_ID.AUTH
      ) {
        this.setStatus('disconnected', namespace)
        StorageUtil.removeConnectedNamespace(namespace)
      }
    }

    this.setLoading(false)
  }

  private async checkExistingTelegramSocialConnection() {
    try {
      if (!CoreHelperUtil.isTelegram()) {
        return
      }
      const socialProviderToConnect = StorageUtil.getTelegramSocialProvider()
      if (!socialProviderToConnect) {
        return
      }
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return
      }
      const url = new URL(window.location.href)
      const resultUri = url.searchParams.get('result_uri')
      if (!resultUri) {
        return
      }
      AccountController.setSocialProvider(
        socialProviderToConnect,
        ChainController.state.activeChain
      )
      await this.authProvider?.init()
      const authConnector = ConnectorController.getAuthConnector()
      if (socialProviderToConnect && authConnector) {
        this.setLoading(true)

        await authConnector.provider.connectSocial(resultUri)
        await ConnectionController.connectExternal(authConnector, authConnector.chain)
        StorageUtil.setConnectedSocialProvider(socialProviderToConnect)
        StorageUtil.removeTelegramSocialProvider()

        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_SUCCESS',
          properties: { provider: socialProviderToConnect }
        })
      }
    } catch (error) {
      this.setLoading(false)
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

  private createAuthProvider() {
    const isEmailEnabled =
      this.options?.features?.email === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.email
        : this.options?.features?.email

    const isSocialsEnabled = this.options?.features?.socials
      ? this.options?.features?.socials?.length > 0
      : CoreConstantsUtil.DEFAULT_FEATURES.socials

    const isAuthEnabled = isEmailEnabled || isSocialsEnabled

    if (!this.authProvider && this.options?.projectId && isAuthEnabled) {
      this.authProvider = W3mFrameProviderSingleton.getInstance({
        projectId: this.options.projectId,
        enableLogger: this.options.enableAuthLogger,
        chainId: this.getCaipNetwork()?.caipNetworkId,
        onTimeout: () => {
          AlertController.open(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT, 'error')
        }
      })
      this.subscribeState(val => {
        if (!val.open) {
          this.authProvider?.rejectRpcRequests()
        }
      })
      this.syncAuthConnector(this.authProvider)
      this.checkExistingTelegramSocialConnection()
    }
  }

  private createAuthProviderForAdapter(chainNamespace: ChainNamespace) {
    // Override as we need to set authProvider for each adapter
    this.createAuthProvider()

    if (this.authProvider) {
      this.chainAdapters?.[chainNamespace]?.setAuthProvider?.(this.authProvider)
    }
  }

  // -- Overrides ----------------------------------------------------------------
  protected override initControllers(options: AppKitOptionsWithSdk) {
    super.initControllers(options)

    if (this.options.excludeWalletIds) {
      ApiController.initializeExcludedWalletRdns({ ids: this.options.excludeWalletIds })
    }
  }

  protected override async syncNamespaceConnection(namespace: ChainNamespace) {
    const isEmailUsed = this.authProvider?.getLoginEmailUsed()

    if (isEmailUsed) {
      return
    }

    await super.syncNamespaceConnection(namespace)
  }

  protected override async switchCaipNetwork(caipNetwork: CaipNetwork) {
    if (!caipNetwork) {
      return
    }

    if (AccountController.state.address) {
      if (caipNetwork.chainNamespace === ChainController.state.activeChain) {
        const adapter = this.getAdapter(ChainController.state.activeChain)
        const provider = ProviderUtil.getProvider(ChainController.state.activeChain)
        const providerType = ProviderUtil.state.providerIds[ChainController.state.activeChain]

        await adapter?.switchNetwork({ caipNetwork, provider, providerType })
        this.setCaipNetwork(caipNetwork)
        await this.syncAccount({
          address: AccountController.state.address,
          chainId: caipNetwork.id,
          chainNamespace: caipNetwork.chainNamespace
        })
      } else {
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

        if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_AUTH) {
          try {
            ChainController.state.activeChain = caipNetwork.chainNamespace
            await this.connectionControllerClient?.connectExternal?.({
              id: ConstantsUtil.CONNECTOR_ID.AUTH,
              provider: this.authProvider,
              chain: caipNetwork.chainNamespace,
              chainId: caipNetwork.id,
              type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
              caipNetwork
            })
            this.setCaipNetwork(caipNetwork)
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
          const address = this.getAddressByChainNamespace(caipNetwork.chainNamespace)
          this.setCaipNetwork(caipNetwork)
          if (address) {
            this.syncAccount({
              address,
              chainId: caipNetwork.id,
              chainNamespace: caipNetwork.chainNamespace
            })
          }
        }
      }
    } else {
      this.setCaipNetwork(caipNetwork)
    }
  }

  protected override async initChainAdapter(namespace: ChainNamespace): Promise<void> {
    await super.initChainAdapter(namespace)
    this.createAuthProviderForAdapter(namespace)
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
    if (!isInitialized && CoreHelperUtil.isClient()) {
      const features = { ...CoreConstantsUtil.DEFAULT_FEATURES, ...this.options.features }

      // Selectively import views based on feature flags
      const featureImportPromises = []
      if (features) {
        const usingEmbeddedWallet = features.email || (features.socials && features.socials.length)
        if (usingEmbeddedWallet) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/embedded-wallet'))
        }

        if (features.email) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/email'))
        }
        if (features.socials) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/socials'))
        }

        if (features.swaps) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/swaps'))
        }

        if (features.send) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/send'))
        }

        if (features.receive) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/receive'))
        }

        if (features.onramp) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/onramp'))
        }

        if (features.history) {
          featureImportPromises.push(import('@reown/appkit-scaffold-ui/transactions'))
        }
      }

      await Promise.all([
        ...featureImportPromises,
        import('@reown/appkit-scaffold-ui'),
        import('@reown/appkit-scaffold-ui/w3m-modal')
      ])
      const modal = document.createElement('w3m-modal')
      if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
        document.body.insertAdjacentElement('beforeend', modal)
      }
      isInitialized = true
    }
  }
}
