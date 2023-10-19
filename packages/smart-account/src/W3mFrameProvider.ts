import { W3mFrame } from './W3mFrame.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'

// -- Resolver --------------------------------------------------------
interface Resolver {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

// -- Provider --------------------------------------------------------
export class W3mFrameProvider {
  private w3mFrame: W3mFrame

  private connectEmailResolver: Resolver | undefined = undefined

  private connectOtpResolver: Resolver | undefined = undefined

  private connectResolver: Resolver | undefined = undefined

  public constructor(projectId: string) {
    this.w3mFrame = new W3mFrame(projectId)
    this.w3mFrame.events.onFrameEvent(event => {
      switch (event.type) {
        case this.w3mFrame.constants.FRAME_CONNECT_EMAIL_SUCCESS:
          return this.onConnectEmailSuccess()
        case this.w3mFrame.constants.FRAME_CONNECT_EMAIL_ERROR:
          return this.onConnectEmailError(event)
        case this.w3mFrame.constants.FRAME_CONNECT_OTP_SUCCESS:
          return this.onConnectOtpSuccess()
        case this.w3mFrame.constants.FRAME_CONNECT_OTP_ERROR:
          return this.onConnectOtpError(event)
        case this.w3mFrame.constants.FRAME_GET_USER_SUCCESS:
          return this.onConnectSuccess(event)
        case this.w3mFrame.constants.FRAME_GET_USER_ERROR:
          return this.onConnectError(event)
        default:
          return null
      }
    })
  }

  // -- Methods --------------------------------------------------------
  public async connectEmail(email: string) {
    this.w3mFrame.events.postAppEvent({
      type: this.w3mFrame.constants.APP_CONNECT_EMAIL,
      payload: { email }
    })

    return new Promise((resolve, reject) => {
      this.connectEmailResolver = { resolve, reject }
    })
  }

  public async connectOtp(otp: string) {
    this.w3mFrame.events.postAppEvent({
      type: this.w3mFrame.constants.APP_CONNECT_OTP,
      payload: { otp }
    })

    return new Promise((resolve, reject) => {
      this.connectOtpResolver = { resolve, reject }
    })
  }

  public async connect() {
    this.w3mFrame.events.postAppEvent({ type: this.w3mFrame.constants.APP_GET_USER })

    return new Promise((resolve, reject) => {
      this.connectResolver = { resolve, reject }
    })
  }

  // -- Handlers -- -----------------------------------------------------
  private onConnectEmailSuccess() {
    this.connectEmailResolver?.resolve()
  }

  private onConnectEmailError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_ERROR' }>
  ) {
    this.connectEmailResolver?.reject(event.payload.message)
  }

  private onConnectOtpSuccess() {
    this.connectOtpResolver?.resolve()
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
}
