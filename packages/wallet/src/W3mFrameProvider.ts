import { W3mFrame } from './W3mFrame.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'
import { W3mFrameConstants, W3mFrameRpcConstants } from './W3mFrameConstants.js'
import { W3mFrameStorage } from './W3mFrameStorage.js'
import { W3mFrameHelpers } from './W3mFrameHelpers.js'
import { W3mFrameLogger } from './W3mFrameLogger.js'

// -- Provider --------------------------------------------------------
export class W3mFrameProvider {
  public w3mLogger: W3mFrameLogger
  private w3mFrame: W3mFrame
  private openRpcRequests: Array<W3mFrameTypes.RPCRequest & { abortController: AbortController }> =
    []

  private rpcRequestHandler?: (request: W3mFrameTypes.RPCRequest) => void
  private rpcSuccessHandler?: (response: W3mFrameTypes.RPCResponse) => void
  private rpcErrorHandler?: (error: Error) => void

  public constructor(projectId: string) {
    this.w3mLogger = new W3mFrameLogger(projectId)
    this.w3mFrame = new W3mFrame(projectId, true)
  }

  // -- Extended Methods ------------------------------------------------
  public getLoginEmailUsed() {
    return Boolean(W3mFrameStorage.get(W3mFrameConstants.EMAIL_LOGIN_USED_KEY))
  }

  public getEmail() {
    return W3mFrameStorage.get(W3mFrameConstants.EMAIL)
  }

  public async connectEmail(payload: W3mFrameTypes.Requests['AppConnectEmailRequest']) {
    try {
      W3mFrameHelpers.checkIfAllowedToTriggerEmail()
      const response = await this.appEvent<'ConnectEmail'>({
        type: W3mFrameConstants.APP_CONNECT_EMAIL,
        payload
      } as W3mFrameTypes.AppEvent)
      this.setNewLastEmailLoginTime()

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error connecting email')
      throw error
    }
  }

  public async connectDevice() {
    try {
      return this.appEvent<'ConnectDevice'>({
        type: W3mFrameConstants.APP_CONNECT_DEVICE
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error connecting device')
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
      this.w3mLogger.logger.error({ error }, 'Error connecting otp')
      throw error
    }
  }

  public async isConnected() {
    try {
      const response = await this.appEvent<'IsConnected'>({
        type: W3mFrameConstants.APP_IS_CONNECTED
      } as W3mFrameTypes.AppEvent)
      if (!response.isConnected) {
        this.deleteAuthLoginCache()
      }

      return response
    } catch (error) {
      this.deleteAuthLoginCache()
      this.w3mLogger.logger.error({ error }, 'Error checking connection')
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
      this.w3mLogger.logger.error({ error }, 'Error getting chain id')
      throw error
    }
  }

  public async getSocialRedirectUri(
    payload: W3mFrameTypes.Requests['AppGetSocialRedirectUriRequest']
  ) {
    try {
      return this.appEvent<'GetSocialRedirectUri'>({
        type: W3mFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
        payload
      } as W3mFrameTypes.AppEvent)
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error getting social redirect uri')
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
      this.w3mLogger.logger.error({ error }, 'Error updating email')
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
      this.w3mLogger.logger.error({ error }, 'Error updating email primary otp')
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
      this.w3mLogger.logger.error({ error }, 'Error updating email secondary otp')
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
      this.w3mLogger.logger.error({ error }, 'Error syncing theme')
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
      this.w3mLogger.logger.error({ error }, 'Error syncing dapp data')
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
      this.w3mLogger.logger.error({ error }, 'Error getting smart account enabled networks')
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
      this.w3mLogger.logger.error({ error }, 'Error setting preferred account')
      throw error
    }
  }

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: W3mFrameTypes.Requests['AppGetUserRequest']) {
    try {
      const chainId = payload?.chainId ?? this.getLastUsedChainId() ?? 1
      const response = await this.appEvent<'GetUser'>({
        type: W3mFrameConstants.APP_GET_USER,
        payload: { ...payload, chainId }
      } as W3mFrameTypes.AppEvent)
      this.setLoginSuccess(response.email)
      this.setLastUsedChainId(response.chainId)

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error connecting')
      throw error
    }
  }

  public async connectSocial(uri: string) {
    try {
      const response = await this.appEvent<'ConnectSocial'>({
        type: W3mFrameConstants.APP_CONNECT_SOCIAL,
        payload: { uri }
      } as W3mFrameTypes.AppEvent)

      if (response.userName) {
        this.setSocialLoginSuccess(response.userName)
      }

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error connecting social')
      throw error
    }
  }

  public async getFarcasterUri() {
    try {
      const response = await this.appEvent<'GetFarcasterUri'>({
        type: W3mFrameConstants.APP_GET_FARCASTER_URI
      } as W3mFrameTypes.AppEvent)

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error getting farcaster uri')
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
      this.w3mLogger.logger.error({ error }, 'Error connecting farcaster')
      throw error
    }
  }

  public async switchNetwork(chainId: number) {
    try {
      const response = await this.appEvent<'SwitchNetwork'>({
        type: W3mFrameConstants.APP_SWITCH_NETWORK,
        payload: { chainId }
      } as W3mFrameTypes.AppEvent)

      this.setLastUsedChainId(response.chainId)

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error switching network')
      throw error
    }
  }

  public async disconnect() {
    try {
      const response = await this.appEvent<'SignOut'>({
        type: W3mFrameConstants.APP_SIGN_OUT
      } as W3mFrameTypes.AppEvent)
      this.deleteAuthLoginCache()

      return response
    } catch (error) {
      this.w3mLogger.logger.error({ error }, 'Error disconnecting')
      throw error
    }
  }

  public async request(req: W3mFrameTypes.RPCRequest): Promise<W3mFrameTypes.RPCResponse> {
    try {
      if (W3mFrameRpcConstants.GET_CHAIN_ID === req.method) {
        return this.getLastUsedChainId()
      }

      this.rpcRequestHandler?.(req)
      const response = await this.appEvent<'Rpc'>({
        type: W3mFrameConstants.APP_RPC_REQUEST,
        payload: req
      } as W3mFrameTypes.AppEvent)

      this.rpcSuccessHandler?.(response)

      return response
    } catch (error) {
      this.rpcErrorHandler?.(error as Error)
      this.w3mLogger.logger.error({ error }, 'Error requesting')
      throw error
    }
  }

  public onRpcRequest(callback: (request: W3mFrameTypes.RPCRequest) => void) {
    this.rpcRequestHandler = callback
  }

  public onRpcSuccess(callback: (request: W3mFrameTypes.FrameEvent) => void) {
    this.rpcSuccessHandler = callback
  }

  public onRpcError(callback: (error: Error) => void) {
    this.rpcErrorHandler = callback
  }

  public onIsConnected(
    callback: (request: W3mFrameTypes.Responses['FrameGetUserResponse']) => void
  ) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_GET_USER_SUCCESS) {
        callback(event.payload)
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

  public onGetSmartAccountEnabledNetworks(callback: (networks: number[]) => void) {
    this.w3mFrame.events.onFrameEvent(event => {
      if (event.type === W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS) {
        callback(event.payload.smartAccountEnabledNetworks)
      } else if (event.type === W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR) {
        callback([])
      }
    })
  }

  // -- Private Methods -------------------------------------------------
  public rejectRpcRequests() {
    try {
      this.openRpcRequests.forEach(({ abortController, method }) => {
        if (!W3mFrameRpcConstants.SAFE_RPC_METHODS.includes(method)) {
          abortController.abort()
        }
      })
      this.openRpcRequests = []
    } catch (e) {
      this.w3mLogger.logger.error({ error: e }, 'Error aborting RPC request')
    }
  }

  private async appEvent<T extends W3mFrameTypes.ProviderRequestType>(
    event: Omit<W3mFrameTypes.AppEvent, 'id'>
  ): Promise<W3mFrameTypes.Responses[`Frame${T}Response`]> {
    await this.w3mFrame.frameLoadPromise
    const type = event.type.replace('@w3m-app/', '')

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7)
      this.w3mLogger.logger.info?.({ event, id }, 'Sending app event')

      this.w3mFrame.events.postAppEvent({ ...event, id } as W3mFrameTypes.AppEvent)
      const abortController = new AbortController()
      if (type === 'RPC_REQUEST') {
        const rpcEvent = event as Extract<W3mFrameTypes.AppEvent, { type: '@w3m-app/RPC_REQUEST' }>
        this.openRpcRequests = [...this.openRpcRequests, { ...rpcEvent.payload, abortController }]
      }
      abortController.signal.addEventListener('abort', () => {
        if (type === 'RPC_REQUEST') {
          reject(new Error('Request was aborted'))
        }
      })

      function handler(framEvent: W3mFrameTypes.FrameEvent) {
        if (framEvent.type === `@w3m-frame/${type}_SUCCESS`) {
          if ('payload' in framEvent) {
            resolve(framEvent.payload)
          }
          resolve(undefined as unknown as W3mFrameTypes.Responses[`Frame${T}Response`])
        } else if (framEvent.type === `@w3m-frame/${type}_ERROR`) {
          if ('payload' in framEvent) {
            reject(new Error(framEvent.payload?.message || 'An error occurred'))
          }
          reject(new Error('An error occurred'))
        }
      }
      this.w3mFrame.events.registerFrameEventHandler(id, handler, abortController.signal)
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
    W3mFrameStorage.delete(W3mFrameConstants.SOCIAL, true)
  }

  private setLastUsedChainId(chainId: number) {
    W3mFrameStorage.set(W3mFrameConstants.LAST_USED_CHAIN_KEY, String(chainId))
  }

  private getLastUsedChainId() {
    return Number(W3mFrameStorage.get(W3mFrameConstants.LAST_USED_CHAIN_KEY))
  }

  private persistSmartAccountEnabledNetworks(networks: number[]) {
    W3mFrameStorage.set(W3mFrameConstants.SMART_ACCOUNT_ENABLED_NETWORKS, networks.join(','))
  }
}
