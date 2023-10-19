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

  public constructor(projectId: string) {
    this.w3mFrame = new W3mFrame(projectId)
    this.w3mFrame.events.onFrameEvent(event => {
      switch (event.type) {
        case this.w3mFrame.constants.FRAME_CONNECT_EMAIL_SUCCESS:
          return this.onConnectEmailSuccess()
        case this.w3mFrame.constants.FRAME_CONNECT_EMAIL_ERROR:
          return this.onConnectEmailError(event)
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

  public async connectOtp() {}

  public async connect() {}

  // -- Private --------------------------------------------------------
  private onConnectEmailSuccess() {
    this.connectEmailResolver?.resolve()
  }

  private onConnectEmailError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_ERROR' }>
  ) {
    this.connectEmailResolver?.reject(event.payload.message)
  }
}
