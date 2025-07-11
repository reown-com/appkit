import {
  type ChainNamespace,
  type EmbeddedWalletTimeoutReason,
  ParseUtil
} from '@reown/appkit-common'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'

import { W3mFrame } from './W3mFrame.js'
import { W3mFrameConstants, W3mFrameRpcConstants } from './W3mFrameConstants.js'
import { W3mFrameHelpers } from './W3mFrameHelpers.js'
import { W3mFrameLogger } from './W3mFrameLogger.js'
import { W3mFrameStorage } from './W3mFrameStorage.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'

type AppEventType = Omit<W3mFrameTypes.AppEvent, 'id'>

interface W3mFrameProviderConfig {
  projectId: string
  chainId?: W3mFrameTypes.Network['chainId']
  enableLogger?: boolean
  onTimeout?: (reason: EmbeddedWalletTimeoutReason) => void
  abortController: AbortController
  enableCloudAuthAccount?: boolean
  getActiveCaipNetwork: (namespace?: ChainNamespace) => CaipNetwork | undefined
}

// -- Provider --------------------------------------------------------
export class W3mFrameProvider {
  public w3mLogger?: W3mFrameLogger
  private w3mFrame: W3mFrame
  private abortController: AbortController
  private getActiveCaipNetwork: (namespace?: ChainNamespace) => CaipNetwork | undefined
  private openRpcRequests: Array<W3mFrameTypes.RPCRequest & { abortController: AbortController }> =
    []

  private rpcRequestHandler?: (request: W3mFrameTypes.RPCRequest) => void
  private rpcSuccessHandler?: (
    response: W3mFrameTypes.RPCResponse,
    request: W3mFrameTypes.RPCRequest
  ) => void
  private rpcErrorHandler?: (error: Error, request: W3mFrameTypes.RPCRequest) => void

  public onTimeout?: (reason: EmbeddedWalletTimeoutReason) => void

  public user?: W3mFrameTypes.Responses['FrameGetUserResponse']
  private isInitialized = false
  private initPromise: Promise<void> | undefined
  public constructor({
    projectId,
    chainId,
    enableLogger = true,
    onTimeout,
    abortController,
    enableCloudAuthAccount,
    getActiveCaipNetwork
  }: W3mFrameProviderConfig) {
    if (enableLogger) {
      this.w3mLogger = new W3mFrameLogger(projectId)
    }
    this.abortController = abortController
    this.getActiveCaipNetwork = getActiveCaipNetwork
    const rpcUrl = this.getRpcUrl(chainId)
    this.w3mFrame = new W3mFrame({
      projectId,
      isAppClient: true,
      chainId,
      enableLogger,
      rpcUrl,
      enableCloudAuthAccount
    })
    this.onTimeout = onTimeout
    if (this.getLoginEmailUsed()) {
      this.createFrame()
    }
  }

  private async createFrame() {
    this.w3mFrame.initFrame()

    this.initPromise = new Promise<void>(resolve => {
      this.w3mFrame.events.onFrameEvent(event => {
        if (event.type === W3mFrameConstants.FRAME_READY) {
          setTimeout(() => {
            resolve()
          }, 500)
        }
      })
    })
    await this.initPromise
    this.isInitialized = true
    this.initPromise = undefined
  }

  public async init() {
    if (this.isInitialized) {
      return
    }

    if (this.initPromise) {
      await this.initPromise

      return
    }

    await this.createFrame()
  }

  // -- Extended Methods ------------------------------------------------
  public getLoginEmailUsed() {
    return Boolean(W3mFrameStorage.get(W3mFrameConstants.EMAIL_LOGIN_USED_KEY))
  }

  public getEmail() {
    return W3mFrameStorage.get(W3mFrameConstants.EMAIL)
  }

  public getUsername() {
    return W3mFrameStorage.get(W3mFrameConstants.SOCIAL_USERNAME)
  }

  public async reload() {
    try {
      await this.appEvent<'Reload'>({
        type: W3mFrameConstants.APP_RELOAD
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error reloading iframe')
      throw error
    }
  }

  public async connectEmail(payload: W3mFrameTypes.Requests['AppConnectEmailRequest']) {
    try {
      W3mFrameHelpers.checkIfAllowedToTriggerEmail()
      await this.init()
      const response = await this.appEvent<'ConnectEmail'>({
        type: W3mFrameConstants.APP_CONNECT_EMAIL,
        payload
      } as W3mFrameTypes.AppEvent)
      this.setNewLastEmailLoginTime()

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting email')
      throw error
    }
  }

  public async connectDevice() {
    try {
      return this.appEvent<'ConnectDevice'>({
        type: W3mFrameConstants.APP_CONNECT_DEVICE
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting device')
      throw error
    }
  }

  public async connectOtp(payload: W3mFrameTypes.Requests['AppConnectOtpRequest']) {
    try {
      return this.appEvent<'ConnectOtp'>({
        type: W3mFrameConstants.APP_CONNECT_OTP,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting otp')
      throw error
    }
  }

  public async isConnected() {
    try {
      if (!this.getLoginEmailUsed()) {
        return { isConnected: false }
      }

      const response = await this.appEvent<'IsConnected'>({
        type: W3mFrameConstants.APP_IS_CONNECTED
      } as W3mFrameTypes.AppEvent)

      if (!response?.isConnected) {
        this.deleteAuthLoginCache()
      }

      return response
    } catch (error) {
      this.deleteAuthLoginCache()
      this.w3mLogger?.logger.error({ error }, 'Error checking connection')
      throw error
    }
  }

  public async getChainId() {
    try {
      const response = await this.appEvent<'GetChainId'>({
        type: W3mFrameConstants.APP_GET_CHAIN_ID
      } as W3mFrameTypes.AppEvent)

      this.setLastUsedChainId(response.chainId)

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error getting chain id')
      throw error
    }
  }

  public async getSocialRedirectUri(
    payload: W3mFrameTypes.Requests['AppGetSocialRedirectUriRequest']
  ) {
    try {
      await this.init()

      return this.appEvent<'GetSocialRedirectUri'>({
        type: W3mFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error getting social redirect uri')
      throw error
    }
  }

  public async updateEmail(payload: W3mFrameTypes.Requests['AppUpdateEmailRequest']) {
    try {
      const response = await this.appEvent<'UpdateEmail'>({
        type: W3mFrameConstants.APP_UPDATE_EMAIL,
        payload
      } as W3mFrameTypes.AppEvent)
      this.setNewLastEmailLoginTime()

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error updating email')
      throw error
    }
  }

  public async updateEmailPrimaryOtp(
    payload: W3mFrameTypes.Requests['AppUpdateEmailPrimaryOtpRequest']
  ) {
    try {
      return this.appEvent<'UpdateEmailPrimaryOtp'>({
        type: W3mFrameConstants.APP_UPDATE_EMAIL_PRIMARY_OTP,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error updating email primary otp')
      throw error
    }
  }

  public async updateEmailSecondaryOtp(
    payload: W3mFrameTypes.Requests['AppUpdateEmailSecondaryOtpRequest']
  ) {
    try {
      const response = await this.appEvent<'UpdateEmailSecondaryOtp'>({
        type: W3mFrameConstants.APP_UPDATE_EMAIL_SECONDARY_OTP,
        payload
      } as W3mFrameTypes.AppEvent)

      this.setLoginSuccess(response.newEmail)

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error updating email secondary otp')
      throw error
    }
  }

  public async syncTheme(payload: W3mFrameTypes.Requests['AppSyncThemeRequest']) {
    try {
      return this.appEvent<'SyncTheme'>({
        type: W3mFrameConstants.APP_SYNC_THEME,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error syncing theme')
      throw error
    }
  }

  public async syncDappData(
    payload: W3mFrameTypes.Requests['AppSyncDappDataRequest']
  ): Promise<W3mFrameTypes.Responses['FrameSyncDappDataResponse']> {
    try {
      return this.appEvent<'SyncDappData'>({
        type: W3mFrameConstants.APP_SYNC_DAPP_DATA,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error syncing dapp data')
      throw error
    }
  }

  public async getSmartAccountEnabledNetworks() {
    try {
      const response = await this.appEvent<'GetSmartAccountEnabledNetworks'>({
        type: W3mFrameConstants.APP_GET_SMART_ACCOUNT_ENABLED_NETWORKS
      } as W3mFrameTypes.AppEvent)

      this.persistSmartAccountEnabledNetworks(response.smartAccountEnabledNetworks)

      return response
    } catch (error) {
      this.persistSmartAccountEnabledNetworks([])
      this.w3mLogger?.logger.error({ error }, 'Error getting smart account enabled networks')
      throw error
    }
  }

  public async setPreferredAccount(type: W3mFrameTypes.AccountType) {
    try {
      return this.appEvent<'SetPreferredAccount'>({
        type: W3mFrameConstants.APP_SET_PREFERRED_ACCOUNT,
        payload: { type }
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error setting preferred account')
      throw error
    }
  }

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: W3mFrameTypes.Requests['AppGetUserRequest']) {
    if (payload?.socialUri) {
      try {
        await this.init()
        const rpcUrl = this.getRpcUrl(payload.chainId)
        const response = await this.appEvent<'ConnectSocial'>({
          type: W3mFrameConstants.APP_CONNECT_SOCIAL,
          payload: {
            uri: payload.socialUri,
            preferredAccountType: payload.preferredAccountType,
            chainId: payload.chainId,
            siwxMessage: payload.siwxMessage,
            rpcUrl
          }
        } as W3mFrameTypes.AppEvent)

        if (response.userName) {
          this.setSocialLoginSuccess(response.userName)
        }

        this.setLoginSuccess(response.email)
        this.setLastUsedChainId(response.chainId)

        this.user = response

        return response
      } catch (error) {
        this.w3mLogger?.logger.error({ error }, 'Error connecting social')
        throw error
      }
    } else {
      try {
        const chainId = payload?.chainId || this.getLastUsedChainId() || 1

        const response = await this.getUser({
          chainId,
          preferredAccountType: payload?.preferredAccountType,
          siwxMessage: payload?.siwxMessage,
          rpcUrl: this.getRpcUrl(chainId)
        })

        this.setLoginSuccess(response.email)
        this.setLastUsedChainId(response.chainId)
        this.user = response

        return response
      } catch (error) {
        this.w3mLogger?.logger.error({ error }, 'Error connecting')
        throw error
      }
    }
  }

  public async getUser(payload: W3mFrameTypes.Requests['AppGetUserRequest']) {
    try {
      await this.init()
      const chainId = payload?.chainId || this.getLastUsedChainId() || 1
      const response = await this.appEvent<'GetUser'>({
        type: W3mFrameConstants.APP_GET_USER,
        payload: { ...payload, chainId }
      } as W3mFrameTypes.AppEvent)
      this.user = response

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting')
      throw error
    }
  }

  public async connectSocial({
    uri,
    chainId,
    preferredAccountType
  }: {
    uri: string
    chainId?: number | string
    preferredAccountType?: string
  }) {
    try {
      await this.init()
      const rpcUrl = this.getRpcUrl(chainId)
      const response = await this.appEvent<'ConnectSocial'>({
        type: W3mFrameConstants.APP_CONNECT_SOCIAL,
        payload: { uri, chainId, rpcUrl, preferredAccountType }
      } as W3mFrameTypes.AppEvent)

      if (response.userName) {
        this.setSocialLoginSuccess(response.userName)
      }

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting social')
      throw error
    }
  }

  public async getFarcasterUri() {
    try {
      await this.init()
      const response = await this.appEvent<'GetFarcasterUri'>({
        type: W3mFrameConstants.APP_GET_FARCASTER_URI
      } as W3mFrameTypes.AppEvent)

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error getting farcaster uri')
      throw error
    }
  }

  public async connectFarcaster() {
    try {
      const response = await this.appEvent<'ConnectFarcaster'>({
        type: W3mFrameConstants.APP_CONNECT_FARCASTER
      } as W3mFrameTypes.AppEvent)

      if (response.userName) {
        this.setSocialLoginSuccess(response.userName)
      }

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error connecting farcaster')
      throw error
    }
  }

  public async switchNetwork({ chainId }: { chainId: number | string }) {
    try {
      const rpcUrl = this.getRpcUrl(chainId)
      const response = await this.appEvent<'SwitchNetwork'>({
        type: W3mFrameConstants.APP_SWITCH_NETWORK,
        payload: { chainId, rpcUrl }
      } as W3mFrameTypes.AppEvent)

      this.setLastUsedChainId(response.chainId)

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error switching network')
      throw error
    }
  }

  public async disconnect() {
    try {
      this.deleteAuthLoginCache()
      const response = await new Promise<void>(async resolve => {
        const timeout = setTimeout(() => {
          resolve()
        }, 3_000)
        await this.appEvent<'SignOut'>({
          type: W3mFrameConstants.APP_SIGN_OUT
        } as W3mFrameTypes.AppEvent)
        clearTimeout(timeout)
        resolve()
      })

      return response
    } catch (error) {
      this.w3mLogger?.logger.error({ error }, 'Error disconnecting')
      throw error
    }
  }

  public async request(req: W3mFrameTypes.RPCRequest): Promise<W3mFrameTypes.RPCResponse> {
    const request = req
    try {
      if (W3mFrameRpcConstants.GET_CHAIN_ID === req.method) {
        return this.getLastUsedChainId()
      }

      /*
       * If chainNamespace is provided in the request, use that namespace to get the chainId, otherwise fallback to 'eip155' namespace since Ethers and Wagmi RPC requests are limited to be modified to include the chainNamespace, so requests from Ethers and Wagmi will never include a chainNamespace
       */
      const namespace = req.chainNamespace || 'eip155'
      const chainId = this.getActiveCaipNetwork(namespace)?.id
      request.chainNamespace = namespace
      request.chainId = chainId
      request.rpcUrl = this.getRpcUrl(chainId)

      this.rpcRequestHandler?.(req)
      const response = await this.appEvent<'Rpc'>({
        type: W3mFrameConstants.APP_RPC_REQUEST,
        payload: request
      } as W3mFrameTypes.AppEvent)

      this.rpcSuccessHandler?.(response, request)

      return response
    } catch (error) {
      this.rpcErrorHandler?.(error as Error, request)
      this.w3mLogger?.logger.error({ error }, 'Error requesting')
      throw error
    }
  }

  public onRpcRequest(callback: (request: W3mFrameTypes.RPCRequest) => void) {
    this.rpcRequestHandler = callback
  }

  public onRpcSuccess(
    callback: (response: W3mFrameTypes.FrameEvent, request: W3mFrameTypes.RPCRequest) => void
  ) {
    this.rpcSuccessHandler = callback
  }

  public onRpcError(callback: (error: Error, request: W3mFrameTypes.RPCRequest) => void) {
    this.rpcErrorHandler = callback
  }

  public onIsConnected(callback: () => void) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (
        event.type === W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS &&
        event.payload.isConnected
      ) {
        callback()
      }
    })
  }

  public onNotConnected(callback: () => void) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_IS_CONNECTED_ERROR) {
        callback()
      }
      if (
        event.type === W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS &&
        !event.payload.isConnected
      ) {
        callback()
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onConnect(callback: (user: W3mFrameTypes.Responses['FrameGetUserResponse']) => void) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_GET_USER_SUCCESS) {
        callback(event.payload)
      }
    })
  }

  public onSocialConnected(
    callback: (user: W3mFrameTypes.Responses['FrameConnectSocialResponse']) => void
  ) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_CONNECT_SOCIAL_SUCCESS) {
        callback(event.payload)
      }
    })
  }

  public async getCapabilities(): Promise<Record<`0x${string}`, W3mFrameTypes.WalletCapabilities>> {
    try {
      const capabilities = await this.request({
        method: 'wallet_getCapabilities'
      })

      return capabilities || {}
    } catch {
      return {}
    }
  }

  public onSetPreferredAccount(
    callback: ({ type, address }: { type: string; address?: string }) => void
  ) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_SUCCESS) {
        callback(event.payload)
      } else if (event.type === W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_ERROR) {
        callback({ type: W3mFrameRpcConstants.ACCOUNT_TYPES.EOA })
      }
    })
  }

  public getAvailableChainIds() {
    return Object.keys(this.w3mFrame.networks)
  }

  // -- Private Methods -------------------------------------------------
  public async rejectRpcRequests() {
    try {
      await Promise.all(
        this.openRpcRequests.map(async ({ abortController, method }) => {
          if (!W3mFrameRpcConstants.SAFE_RPC_METHODS.includes(method)) {
            abortController.abort()
          }

          await this.appEvent<'RpcAbort'>({
            type: W3mFrameConstants.APP_RPC_ABORT
          })
        })
      )
      this.openRpcRequests = []
    } catch (e) {
      this.w3mLogger?.logger.error({ error: e }, 'Error aborting RPC request')
    }
  }

  private async appEvent<T extends W3mFrameTypes.ProviderRequestType>(
    event: AppEventType
  ): Promise<W3mFrameTypes.Responses[`Frame${T}Response`]> {
    let requestTimeout: ReturnType<typeof setTimeout> | undefined = undefined

    let iframeReadyTimeout: ReturnType<typeof setTimeout> | undefined = undefined

    function replaceEventType(type: AppEventType['type']) {
      return type.replace('@w3m-app/', '')
    }

    const safeEventTypes = [
      W3mFrameConstants.APP_SYNC_DAPP_DATA,
      W3mFrameConstants.APP_SYNC_THEME,
      W3mFrameConstants.APP_SET_PREFERRED_ACCOUNT
    ] as const

    const type = replaceEventType(event.type)

    // If the iframe is not ready being initialized after 20 seconds, timeout.
    if (
      !this.w3mFrame.iframeIsReady &&
      !safeEventTypes.includes(event.type as (typeof safeEventTypes)[number])
    ) {
      iframeReadyTimeout = setTimeout(() => {
        this.onTimeout?.('iframe_load_failed')
        this.abortController.abort()
      }, 20_000)
    }

    await this.w3mFrame.frameLoadPromise

    clearTimeout(iframeReadyTimeout)

    const shouldCheckForTimeout = [
      W3mFrameConstants.APP_CONNECT_EMAIL,
      W3mFrameConstants.APP_CONNECT_DEVICE,
      W3mFrameConstants.APP_CONNECT_OTP,
      W3mFrameConstants.APP_CONNECT_SOCIAL,
      W3mFrameConstants.APP_GET_SOCIAL_REDIRECT_URI
    ]
      .map(replaceEventType)
      .includes(type)

    // If the request is not being resolved after 2 minutes, timeout.
    if (shouldCheckForTimeout) {
      requestTimeout = setTimeout(() => {
        this.onTimeout?.('iframe_request_timeout')
        this.abortController.abort()
      }, 120_000)
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7)
      this.w3mLogger?.logger.info?.({ event, id }, 'Sending app event')
      this.w3mFrame.events.postAppEvent({ ...event, id } as W3mFrameTypes.AppEvent)
      const abortController = new AbortController()
      if (type === 'RPC_REQUEST') {
        const rpcEvent = event as Extract<W3mFrameTypes.AppEvent, { type: '@w3m-app/RPC_REQUEST' }>
        this.openRpcRequests = [...this.openRpcRequests, { ...rpcEvent.payload, abortController }]
      }
      abortController.signal.addEventListener('abort', () => {
        if (type === 'RPC_REQUEST') {
          reject(new Error('Request was aborted'))
        } else if (type !== 'GET_FARCASTER_URI') {
          reject(new Error('Something went wrong'))
        }
      })

      function handler(framEvent: W3mFrameTypes.FrameEvent, logger?: W3mFrameLogger) {
        if (framEvent.id !== id) {
          return
        }
        logger?.logger.info?.({ framEvent, id }, 'Received frame response')

        if (framEvent.type === `@w3m-frame/${type}_SUCCESS`) {
          if (requestTimeout) {
            clearTimeout(requestTimeout)
          }
          if (iframeReadyTimeout) {
            clearTimeout(iframeReadyTimeout)
          }
          if ('payload' in framEvent) {
            resolve(framEvent.payload)
          }
          resolve(undefined as unknown as W3mFrameTypes.Responses[`Frame${T}Response`])
        } else if (framEvent.type === `@w3m-frame/${type}_ERROR`) {
          if (requestTimeout) {
            clearTimeout(requestTimeout)
          }
          if (iframeReadyTimeout) {
            clearTimeout(iframeReadyTimeout)
          }
          if ('payload' in framEvent) {
            reject(new Error(framEvent.payload?.message || 'An error occurred'))
          }
          reject(new Error('An error occurred'))
        }
      }
      this.w3mFrame.events.registerFrameEventHandler(
        id,
        frameEvent => handler(frameEvent, this.w3mLogger),
        this.abortController.signal
      )
    })
  }

  private setNewLastEmailLoginTime() {
    W3mFrameStorage.set(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString())
  }

  private setSocialLoginSuccess(username: string) {
    W3mFrameStorage.set(W3mFrameConstants.SOCIAL_USERNAME, username)
  }

  private setLoginSuccess(email?: string | null) {
    if (email) {
      W3mFrameStorage.set(W3mFrameConstants.EMAIL, email)
    }

    W3mFrameStorage.set(W3mFrameConstants.EMAIL_LOGIN_USED_KEY, 'true')
    W3mFrameStorage.delete(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME)
  }

  private deleteAuthLoginCache() {
    W3mFrameStorage.delete(W3mFrameConstants.EMAIL_LOGIN_USED_KEY)
    W3mFrameStorage.delete(W3mFrameConstants.EMAIL)
    W3mFrameStorage.delete(W3mFrameConstants.LAST_USED_CHAIN_KEY)
    W3mFrameStorage.delete(W3mFrameConstants.SOCIAL_USERNAME)
  }

  private setLastUsedChainId(chainId: string | number) {
    if (chainId) {
      W3mFrameStorage.set(W3mFrameConstants.LAST_USED_CHAIN_KEY, String(chainId))
    }
  }

  public getLastUsedChainId() {
    const chainId = W3mFrameStorage.get(W3mFrameConstants.LAST_USED_CHAIN_KEY) ?? undefined
    const numberChainId = Number(chainId)

    return isNaN(numberChainId) ? chainId : numberChainId
  }

  private persistSmartAccountEnabledNetworks(networks: number[]) {
    W3mFrameStorage.set(W3mFrameConstants.SMART_ACCOUNT_ENABLED_NETWORKS, networks.join(','))
  }

  private getRpcUrl(chainId?: number | string) {
    let namespace: ChainNamespace | undefined = chainId === undefined ? undefined : 'eip155'

    if (typeof chainId === 'string') {
      if (chainId.includes(':')) {
        namespace = ParseUtil.parseCaipNetworkId(chainId as CaipNetworkId)?.chainNamespace
      } else if (Number.isInteger(Number(chainId))) {
        namespace = 'eip155'
      } else {
        namespace = 'solana'
      }
    }

    const activeNetwork = this.getActiveCaipNetwork(namespace)

    return activeNetwork?.rpcUrls.default.http?.[0]
  }
}

export interface W3mFrameProviderMethods {
  // Email
  connectEmail: W3mFrameProvider['connectEmail']
  connectOtp: W3mFrameProvider['connectOtp']
  updateEmail: W3mFrameProvider['updateEmail']
  updateEmailPrimaryOtp: W3mFrameProvider['updateEmailPrimaryOtp']
  updateEmailSecondaryOtp: W3mFrameProvider['updateEmailSecondaryOtp']
  getEmail: W3mFrameProvider['getEmail']

  // Social
  connectDevice: W3mFrameProvider['connectDevice']
  connectSocial: W3mFrameProvider['connectSocial']
  getSocialRedirectUri: W3mFrameProvider['getSocialRedirectUri']

  // Farcaster
  connectFarcaster: W3mFrameProvider['connectFarcaster']
  getFarcasterUri: W3mFrameProvider['getFarcasterUri']

  // Misc
  syncTheme: W3mFrameProvider['syncTheme']
  syncDappData: W3mFrameProvider['syncDappData']
  switchNetwork: W3mFrameProvider['switchNetwork']
}
