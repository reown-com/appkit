import { W3mFrameConstants } from './W3mFrameConstants.js'
import { W3mFrameSchema } from './W3mFrameSchema.js'
import { W3mFrameHelpers } from './W3mFrameHelpers.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'

// -- Sdk --------------------------------------------------------------------
export class W3mFrame {
  private iframe: HTMLIFrameElement | null = null

  private projectId: string

  private rpcUrl = W3mFrameHelpers.getBlockchainApiUrl()

  public frameLoadPromise: Promise<void>

  public frameLoadPromiseResolver:
    | {
        resolve: (value: undefined) => void
        reject: (reason?: unknown) => void
      }
    | undefined

  public constructor(projectId: string, isAppClient = false) {
    this.projectId = projectId
    this.frameLoadPromise = new Promise((resolve, reject) => {
      this.frameLoadPromiseResolver = { resolve, reject }
    })

    // Create iframe only when sdk is initialised from dapp / web3modal
    if (isAppClient) {
      this.frameLoadPromise = new Promise((resolve, reject) => {
        this.frameLoadPromiseResolver = { resolve, reject }
      })
      const iframe = document.createElement('iframe')
      iframe.src = W3mFrameConstants.SECURE_SITE
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
      this.iframe = iframe
      this.iframe.onload = () => {
        this.frameLoadPromiseResolver?.resolve(undefined)
      }
      this.iframe.onerror = () => {
        this.frameLoadPromiseResolver?.reject()
      }
    }
  }

  // -- Networks --------------------------------------------------------------
  get networks(): Record<number, W3mFrameTypes.Network> {
    return {
      1: {
        rpcUrl: `${this.rpcUrl}/v1/?chainId=eip155:1&projectId=${this.projectId}`,
        chainId: 1
      },

      11155111: {
        rpcUrl: `${this.rpcUrl}/v1/?chainId=eip155:11155111&projectId=${this.projectId}`,
        chainId: 11155111
      }
    }
  }

  // -- Events ----------------------------------------------------------------
  public events = {
    onFrameEvent: (callback: (event: W3mFrameTypes.FrameEvent) => void) => {
      window.addEventListener('message', ({ data }) => {
        if (!data.type?.includes(W3mFrameConstants.FRAME_EVENT_KEY)) {
          return
        }
        const frameEvent = W3mFrameSchema.frameEvent.parse(data)
        callback(frameEvent)
      })
    },

    onAppEvent: (callback: (event: W3mFrameTypes.AppEvent) => void) => {
      window.addEventListener('message', ({ data }) => {
        if (!data.type?.includes(W3mFrameConstants.APP_EVENT_KEY)) {
          return
        }
        const appEvent = W3mFrameSchema.appEvent.parse(data)
        callback(appEvent)
      })
    },

    postAppEvent: (event: W3mFrameTypes.AppEvent) => {
      if (!this.iframe?.contentWindow) {
        throw new Error('W3mFrameUtil: iframe is not set')
      }
      this.iframe.contentWindow.postMessage(event, '*')
    },

    postFrameEvent: (event: W3mFrameTypes.FrameEvent) => {
      parent.postMessage(event, '*')
    }
  }
}
