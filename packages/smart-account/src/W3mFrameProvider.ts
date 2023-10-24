import { W3mFrame } from './W3mFrame.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'
import { W3mFrameConstants } from './W3mFrameConstants.js'

// -- Resolver --------------------------------------------------------
interface Resolver<T> {
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

// -- Provider --------------------------------------------------------
export class W3mFrameProvider {
  private w3mFrame: W3mFrame

  private connectEmailResolver: Resolver<undefined> | undefined = undefined

  private connectOtpResolver: Resolver<undefined> | undefined = undefined

  private connectResolver:
    | Resolver<{ address: string; email: string; chainId: number }>
    | undefined = undefined

  private disconnectResolver: Resolver<undefined> | undefined = undefined

  private isConnectedResolver: Resolver<{ isConnected: boolean }> | undefined = undefined

  private getChainIdResolver: Resolver<{ chainId: number }> | undefined = undefined

  public constructor(projectId: string) {
    this.w3mFrame = new W3mFrame(projectId, true)
    this.w3mFrame.events.onFrameEvent(event => {
      // eslint-disable-next-line no-console
      console.log('💻 received', event)

      switch (event.type) {
        case W3mFrameConstants.FRAME_CONNECT_EMAIL_SUCCESS:
          return this.onConnectEmailSuccess()
        case W3mFrameConstants.FRAME_CONNECT_EMAIL_ERROR:
          return this.onConnectEmailError(event)
        case W3mFrameConstants.FRAME_CONNECT_OTP_SUCCESS:
          return this.onConnectOtpSuccess()
        case W3mFrameConstants.FRAME_CONNECT_OTP_ERROR:
          return this.onConnectOtpError(event)
        case W3mFrameConstants.FRAME_GET_USER_SUCCESS:
          return this.onConnectSuccess(event)
        case W3mFrameConstants.FRAME_GET_USER_ERROR:
          return this.onConnectError(event)
        case W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS:
          return this.onIsConnectedSuccess(event)
        case W3mFrameConstants.FRAME_IS_CONNECTED_ERROR:
          return this.onIsConnectedError(event)
        case W3mFrameConstants.FRAME_GET_CHAIN_ID_SUCCESS:
          return this.onGetChainIdSuccess(event)
        case W3mFrameConstants.FRAME_GET_CHAIN_ID_ERROR:
          return this.onGetChainIdError(event)
        case W3mFrameConstants.FRAME_SIGN_OUT_SUCCESS:
          return this.onSignOutSuccess()
        case W3mFrameConstants.FRAME_SIGN_OUT_ERROR:
          return this.onSignOutError(event)
        default:
          return null
      }
    })
  }

  // -- Extended Methods ------------------------------------------------
  public async connectEmail(email: string) {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({
      type: W3mFrameConstants.APP_CONNECT_EMAIL,
      payload: { email }
    })

    return new Promise((resolve, reject) => {
      this.connectEmailResolver = { resolve, reject }
    })
  }

  public async connectOtp(otp: string) {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({
      type: W3mFrameConstants.APP_CONNECT_OTP,
      payload: { otp }
    })

    return new Promise((resolve, reject) => {
      this.connectOtpResolver = { resolve, reject }
    })
  }

  public async isConnected() {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_IS_CONNECTED })

    return new Promise<{ isConnected: boolean }>((resolve, reject) => {
      this.isConnectedResolver = { resolve, reject }
    })
  }

  public async getChainId() {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_GET_CHAIN_ID })

    return new Promise<{ chainId: number }>((resolve, reject) => {
      this.getChainIdResolver = { resolve, reject }
    })
  }

  // -- Provider Methods ------------------------------------------------
  public async connect() {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_GET_USER })

    return new Promise<{ address: string; email: string; chainId: number }>((resolve, reject) => {
      this.connectResolver = { resolve, reject }
    })
  }

  public async disconnect() {
    await this.w3mFrame.frameLoadPromise

    this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_SIGN_OUT })

    return new Promise((resolve, reject) => {
      this.disconnectResolver = { resolve, reject }
    })
  }

  public async request() {
    // IMPLEMENT
  }

  // -- Promise Handlers ------------------------------------------------
  private onConnectEmailSuccess() {
    this.connectEmailResolver?.resolve(undefined)
  }

  private onConnectEmailError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_ERROR' }>
  ) {
    this.connectEmailResolver?.reject(event.payload.message)
  }

  private onConnectOtpSuccess() {
    this.connectOtpResolver?.resolve(undefined)
  }

  private onConnectOtpError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_OTP_ERROR' }>
  ) {
    this.connectOtpResolver?.reject(event.payload.message)
  }

  private onConnectSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_SUCCESS' }>
  ) {
    this.connectResolver?.resolve(event.payload)
  }

  private onConnectError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_ERROR' }>
  ) {
    this.connectResolver?.reject(event.payload.message)
  }

  private onIsConnectedSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_SUCCESS' }>
  ) {
    this.isConnectedResolver?.resolve(event.payload)
  }

  private onIsConnectedError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_ERROR' }>
  ) {
    this.isConnectedResolver?.reject(event.payload.message)
  }

  private onGetChainIdSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_SUCCESS' }>
  ) {
    this.getChainIdResolver?.resolve(event.payload)
  }

  private onGetChainIdError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_ERROR' }>
  ) {
    this.getChainIdResolver?.reject(event.payload.message)
  }

  private onSignOutSuccess() {
    this.disconnectResolver?.resolve(undefined)
  }

  private onSignOutError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SIGN_OUT_ERROR' }>
  ) {
    this.disconnectResolver?.reject(event.payload.message)
  }
}
