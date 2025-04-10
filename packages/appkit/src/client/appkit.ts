/* eslint-disable max-depth */
import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
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
      const address = AccountController.state.address
      const caipNetwork = ChainController.state.activeCaipNetwork

      if (isSafeRequest) {
        return
      }
      if (this.isTransactionStackEmpty()) {
        this.close()
        if (address && caipNetwork?.id) {
          this.updateNativeBalance(address, caipNetwork.id, caipNetwork.chainNamespace)
        }
      } else {
        this.popTransactionStack()
        if (address && caipNetwork?.id) {
          this.updateNativeBalance(address, caipNetwork.id, caipNetwork.chainNamespace)
        }
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
    provider.onConnect(async user => {
      const namespace = ChainController.state.activeChain as ChainNamespace

      // To keep backwards compatibility, eip155 chainIds are numbers and not actual caipChainIds
      const caipAddress =
        namespace === ConstantsUtil.CHAIN.EVM
          ? (`eip155:${user.chainId}:${user.address}` as CaipAddress)
          : (`${user.chainId}:${user.address}` as CaipAddress)
      this.setSmartAccountDeployed(Boolean(user.smartAccountDeployed), namespace)

      const preferredAccountType = OptionsController.state.defaultAccountTypes[
        namespace
      ] as W3mFrameTypes.AccountType

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

      this.setUser({ ...(AccountController.state.user || {}), email: user.email }, namespace)

      this.setPreferredAccountType(
        (user.preferredAccountType as W3mFrameTypes.AccountType) || preferredAccountType,
        namespace
      )

      const userAccounts = user.accounts?.map(account =>
        CoreHelperUtil.createAccount(
          namespace,
          account.address,
          account.type || OptionsController.state.defaultAccountTypes[namespace]
        )
      )

      this.setAllAccounts(
        userAccounts || [
          CoreHelperUtil.createAccount(
            namespace,
            user.address,
            (user.preferredAccountType as W3mFrameTypes.AccountType) || preferredAccountType
          )
        ],
        namespace
      )

      await provider.getSmartAccountEnabledNetworks()
      this.setLoading(false, namespace)
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

  private async syncAuthConnector(provider: W3mFrameProvider, chainNamespace: ChainNamespace) {
    const isAuthSupported = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.includes(chainNamespace)

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

    if (chainNamespace && isAuthSupported) {
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
      if (typeof window === 'undefined' || typeof document === 'undefined') {
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
        chainId: this.getCaipNetwork(chainNamespace)?.caipNetworkId,
        onTimeout: () => {
          AlertController.open(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT, 'error')
        }
      })
      this.subscribeState(val => {
        if (!val.open) {
          this.authProvider?.rejectRpcRequests()
        }
      })
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
    const namespaceAddress = this.getAddressByChainNamespace(caipNetwork.chainNamespace)

    if (caipNetwork.chainNamespace === ChainController.state.activeChain && namespaceAddress) {
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

      if (
        // If the current namespace is one of the auth connector supported chains, when switching to other supported namespace, we should use the auth connector
        (isCurrentNamespaceAuthProvider || isNewNamespaceAuthProvider) &&
        isNewNamespaceSupportsAuthConnector
      ) {
        try {
          ChainController.state.activeChain = caipNetwork.chainNamespace
          await this.connectionControllerClient?.connectExternal?.({
            id: ConstantsUtil.CONNECTOR_ID.AUTH,
            provider: this.authProvider,
            chain: networkNamespace,
            chainId: caipNetwork.id,
            type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
            caipNetwork
          })
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

  protected override async initChainAdapter(namespace: ChainNamespace): Promise<void> {
    await super.initChainAdapter(namespace)
    this.createAuthProviderForAdapter(namespace)
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

      if (!name) {
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
    if (!isInitialized && CoreHelperUtil.isClient()) {
      const features = { ...CoreConstantsUtil.DEFAULT_FEATURES, ...this.options.features }

      // Selectively import views based on feature flags
      const featureImportPromises = []
      if (features) {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
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
      const isElementCreated = document.querySelector('w3m-modal')
      if (!isElementCreated) {
        const modal = document.createElement('w3m-modal')
        if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
          document.body.insertAdjacentElement('beforeend', modal)
        }
      }
      isInitialized = true
    }
  }
}
