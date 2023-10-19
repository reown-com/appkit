import { z } from 'zod'
import { W3mFrameHelpers } from './W3mFrameHelpers.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'

const zErrorPayload = z.object({ message: z.string() })

export class W3mFrame {
  private iframe: HTMLIFrameElement | null = null

  private projectId: string

  private rpcUrl = W3mFrameHelpers.getBlockchainApiUrl()

  public constructor(projectId: string) {
    this.projectId = projectId
    const iframe = document.createElement('iframe')
    iframe.src = this.constants.SECURE_SITE
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    this.iframe = iframe
  }

  // -- Networks ---------------------------------------------------------------
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

  // -- Constants --------------------------------------------------------------
  public constants = {
    SECURE_SITE: 'http://localhost:3010',
    APP_EVENT_KEY: '@w3m-app/',
    FRAME_EVENT_KEY: '@w3m-frame/',

    APP_SWITCH_NETWORK: '@w3m-app/SWITCH_NETWORK',
    APP_CONNECT_EMAIL: '@w3m-app/CONNECT_EMAIL',
    APP_CONNECT_OTP: '@w3m-app/CONNECT_OTP',
    APP_GET_USER: '@w3m-app/GET_USER',
    APP_SIGN_OUT: '@w3m-app/SIGN_OUT',

    FRAME_SWITCH_NETWORK_ERROR: '@w3m-frame/SWITCH_NETWORK_ERROR',
    FRAME_SWITCH_NETWORK_SUCCESS: '@w3m-frame/SWITCH_NETWORK_SUCCESS',
    FRAME_CONNECT_EMAIL_ERROR: '@w3m-frame/CONNECT_EMAIL_ERROR',
    FRAME_CONNECT_EMAIL_SUCCESS: '@w3m-frame/CONNECT_EMAIL_SUCCESS',
    FRAME_CONNECT_OTP_SUCCESS: '@w3m-frame/CONNECT_OTP_SUCCESS',
    FRAME_CONNECT_OTP_ERROR: '@w3m-frame/FRAME_CONNECT_OTP_ERROR',
    FRAME_GET_USER_SUCCESS: '@w3m-frame/GET_USER_SUCCESS',
    FRAME_GET_USER_ERROR: '@w3m-frame/GET_USER_ERROR',
    FRAME_SIGN_OUT_SUCCESS: '@w3m-frame/SIGN_OUT_SUCCESS',
    FRAME_SIGN_OUT_ERROR: '@w3m-frame/SIGN_OUT_ERROR'
  } as const

  // -- Schema -----------------------------------------------------------------
  public schema = {
    // App Schema
    appEvent: z
      .object({
        type: z.literal(this.constants.APP_SWITCH_NETWORK),
        payload: z.object({
          chainId: z.number()
        })
      })
      .or(
        z.object({
          type: z.literal(this.constants.APP_CONNECT_EMAIL),
          payload: z.object({
            email: z.string().email()
          })
        })
      )
      .or(
        z.object({
          type: z.literal(this.constants.APP_CONNECT_OTP),
          payload: z.object({
            otp: z.string()
          })
        })
      )
      .or(z.object({ type: z.literal(this.constants.APP_GET_USER) }))
      .or(z.object({ type: z.literal(this.constants.APP_SIGN_OUT) })),

    // Frame Schema
    frameEvent: z
      .object({
        type: z.literal(this.constants.FRAME_SWITCH_NETWORK_ERROR),
        payload: zErrorPayload
      })
      .or(z.object({ type: z.literal(this.constants.FRAME_SWITCH_NETWORK_SUCCESS) }))
      .or(
        z.object({
          type: z.literal(this.constants.FRAME_CONNECT_EMAIL_ERROR),
          payload: zErrorPayload
        })
      )
      .or(z.object({ type: z.literal(this.constants.FRAME_CONNECT_EMAIL_SUCCESS) }))
      .or(
        z.object({
          type: z.literal(this.constants.FRAME_CONNECT_OTP_ERROR),
          payload: zErrorPayload
        })
      )
      .or(z.object({ type: z.literal(this.constants.FRAME_CONNECT_OTP_SUCCESS) }))
      .or(
        z.object({
          type: z.literal(this.constants.FRAME_GET_USER_SUCCESS),
          payload: z.object({
            address: z.string()
          })
        })
      )
      .or(
        z.object({
          type: z.literal(this.constants.FRAME_GET_USER_ERROR),
          payload: zErrorPayload
        })
      )
      .or(z.object({ type: z.literal(this.constants.FRAME_SIGN_OUT_SUCCESS) }))
      .or(
        z.object({ type: z.literal(this.constants.FRAME_SIGN_OUT_ERROR), payload: zErrorPayload })
      )
  }

  // -- Events -----------------------------------------------------------------
  public events = {
    onFrameEvent: (callback: (event: W3mFrameTypes.FrameEvent) => void) => {
      window.addEventListener('message', ({ data }) => {
        if (!data.type?.includes(this.constants.FRAME_EVENT_KEY)) {
          return
        }
        const frameEvent = this.schema.frameEvent.parse(data)
        callback(frameEvent)
      })
    },

    onAppEvent: (callback: (event: W3mFrameTypes.AppEvent) => void) => {
      window.addEventListener('message', ({ data }) => {
        if (!data.type?.includes(this.constants.APP_EVENT_KEY)) {
          return
        }
        const appEvent = this.schema.appEvent.parse(data)
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
